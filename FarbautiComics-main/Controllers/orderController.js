import { StatusCodes } from 'http-status-codes';
import { supabase } from '../Utils/supabaseClient.js';
import { mapOrderRow, mapProductRow } from '../Utils/dbMappers.js';

// POST /api/v1/orders/checkout
// Crea una orden a partir del carrito del usuario y vacia el carrito
export const createOrder = async (req, res) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.userId)
    .single();

  if (userError) throw userError;

  const cartIds = user.cart_data || [];

  const { data: cartRows, error: cartError } = await supabase
    .from('products')
    .select('*')
    .in('id', cartIds.length ? cartIds : ['00000000-0000-0000-0000-000000000000']);

  if (cartError) throw cartError;

  const cartProducts = (cartRows || []).map(mapProductRow);

  if (cartProducts.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'El carrito está vacío' });
  }

  // Verificar y descontar stock de cada producto
  for (const product of cartProducts) {
    if (product.stock <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        msg: `"${product.title}" se quedó sin stock` 
      });
    }

    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: product.stock - 1 })
      .eq('id', product._id);

    if (stockError) throw stockError;
  }

  const items = cartProducts.map((p) => ({
    product: p._id,
    title: p.title,
    price: p.price,
    category: p.category,
    image: p.image
  }));

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const total = subtotal; // envío gratis

  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  const pad = String((count || 0) + 1).padStart(6, '0');
  const invoiceNumber = `FAR-${new Date().getFullYear()}-${pad}`;

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      user_name: `${user.name} ${user.last_name}`,
      user_email: user.email,
      items,
      subtotal,
      total,
      invoice_number: invoiceNumber,
    })
    .select('*')
    .single();

  if (orderError) throw orderError;

  const order = mapOrderRow(orderRow);

  // Agregar a purchases y vaciar carrito
  const purchases = [...(user.purchases || []), ...cartIds];

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      purchases,
      cart_data: [],
    })
    .eq('id', user.id);

  if (userUpdateError) throw userUpdateError;

  res.status(StatusCodes.CREATED).json({ order });
};


// GET /api/v1/orders/my-orders
// Devuelve todas las facturas del usuario logueado
export const getMyOrders = async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', req.user.userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const orders = (data || []).map(mapOrderRow);
  res.status(StatusCodes.OK).json({ orders });
};

// GET /api/v1/orders/admin/report
// Reporte de ventas para admin con filtros opcionales
// Query params: period (week|month|year), category, startDate, endDate
export const getSalesReport = async (req, res) => {
  const { period, category, startDate, endDate } = req.query;

  // Construir filtro de fecha
  let dateFilter = {};
  const now = new Date();

  if (startDate && endDate) {
    dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
  } else if (period === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (period === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    dateFilter = { createdAt: { $gte: monthAgo } };
  } else if (period === 'year') {
    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);
    dateFilter = { createdAt: { $gte: yearAgo } };
  }

  // Obtener ordenes con filtro de fecha
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  let orders = (data || []).map(mapOrderRow);

  if (dateFilter.createdAt?.$gte || dateFilter.createdAt?.$lte) {
    orders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const minDate = dateFilter.createdAt.$gte || new Date('1970-01-01');
      const maxDate = dateFilter.createdAt.$lte || new Date('2999-12-31');
      return orderDate >= minDate && orderDate <= maxDate;
    });
  }

  // Si hay filtro de categoria, filtrar items
  let filteredOrders = orders;
  if (category) {
    const catLower = String(category).toLowerCase();
    filteredOrders = orders
      .map((o) => {
        const filteredItems = (o.items || []).filter((item) => {
          const itemCat = item.category || '';
          return itemCat.toLowerCase().includes(catLower);
        });
        if (filteredItems.length === 0) return null;
        return { ...o, items: filteredItems };
      })
      .filter(Boolean);
  }

  // Calcular estadisticas agregadas
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const totalItemsSold = filteredOrders.reduce((sum, o) => sum + o.items.length, 0);

  // Ventas por categoria
  const salesByCategory = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.category || 'unknown';
      if (!salesByCategory[cat]) salesByCategory[cat] = { count: 0, revenue: 0 };
      salesByCategory[cat].count += 1;
      salesByCategory[cat].revenue += item.price || 0;
    });
  });

  // Ventas por mes (ultimos 12 meses)
  const salesByMonth = {};
  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!salesByMonth[key]) salesByMonth[key] = { count: 0, revenue: 0 };
    salesByMonth[key].count += 1;
    salesByMonth[key].revenue += order.total;
  });

  // Top 5 comics mas vendidos
  const comicSales = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.title;
      if (!comicSales[key]) comicSales[key] = { title: item.title, category: item.category, count: 0, revenue: 0, image: item.image };
      comicSales[key].count += 1;
      comicSales[key].revenue += item.price || 0;
    });
  });
  const topComics = Object.values(comicSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.status(StatusCodes.OK).json({
    summary: { totalRevenue, totalOrders, totalItemsSold },
    salesByCategory,
    salesByMonth,
    topComics,
    orders: filteredOrders
  });
};

// GET /api/v1/orders/admin/:orderId
// Devuelve el detalle de una orden para el admin
export const getAdminOrder = async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.orderId)
    .maybeSingle();

  if (error) throw error;

  const order = data ? mapOrderRow(data) : null;
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Orden no encontrada' });
  res.status(StatusCodes.OK).json({ order });
};

// POST /api/v1/orders/:orderId/cancel
// Cancela una orden del usuario logueado y devuelve el stock
export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  // Obtener la orden
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  if (!orderData) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Orden no encontrada' });
  }

  // Verificar que la orden pertenece al usuario logueado
  if (orderData.user_id !== req.user.userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'No tienes permiso para cancelar esta orden' });
  }

  // Verificar que la orden está en estado 'completed'
  if (orderData.status !== 'completed') {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: `Esta orden no puede cancelarse (estado: ${orderData.status})` });
  }

  // Verificar que no haya pasado más de 7 días desde la creación
  const createdDate = new Date(orderData.created_at);
  const now = new Date();
  const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  if (daysPassed > 7) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Solo se pueden cancelar órdenes dentro de 7 días' });
  }

  // Devolver stock a los productos
  const items = orderData.items || [];
  for (const item of items) {
    const { data: product, error: getProductError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product)
      .single();

    if (!getProductError && product) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: (product.stock || 0) + 1 })
        .eq('id', item.product);

      if (updateError) throw updateError;
    }
  }

  // Actualizar el estado de la orden a 'refunded'
  const { data: updatedOrder, error: updateOrderError } = await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateOrderError) throw updateOrderError;

  const order = mapOrderRow(updatedOrder);
  res.status(StatusCodes.OK).json({ msg: 'Orden cancelada exitosamente', order });
};
