import { StatusCodes } from "http-status-codes";
import { registerInteraction } from "../Utils/Interactions.js";
import { supabase } from '../Utils/supabaseClient.js';
import { mapProductRow, mapUserRow } from '../Utils/dbMappers.js';

const EMPTY_TITLE = '__no_recommendation__';

const fetchUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

const fetchProductByExternalId = async (externalId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('external_id', externalId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const fetchProductsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);

  if (error) throw error;

  const productsById = Object.fromEntries((data || []).map((product) => [product.id, product]));
  return ids
    .map((id) => productsById[id])
    .filter(Boolean)
    .map(mapProductRow);
};

const getReadHistory = (user) => user?.read_history || user?.readhistory || [];

const getUserProductIds = (user) => {
  const ids = [
    ...(user?.favorites || []),
    ...(user?.wishlist || []),
    ...(getReadHistory(user) || []),
    ...(user?.cart_data || []),
  ];

  return [...new Set(ids)];
};

const getTopCategory = (products) => {
  const categoryCounts = new Map();

  for (const product of products) {
    if (!product?.category) continue;
    const category = product.category.trim();
    if (!category) continue;

    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }

  let topCategory = null;
  let topCount = 0;

  for (const [category, count] of categoryCounts.entries()) {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return topCategory;
};

const updateReadHistory = async (userId, readHistory) => {
  const payloadCandidates = [
    { read_history: readHistory },
    { readhistory: readHistory },
  ];

  let lastError = null;

  for (const payload of payloadCandidates) {
    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId);

    if (!error) {
      return;
    }

    lastError = error;

    const missingColumn = error?.code === 'PGRST204' || /does not exist|could not find/i.test(error?.message || '');
    if (!missingColumn) {
      break;
    }
  }

  throw lastError;
};

export const getCurrentUser = async (req, res) => {
  const user = await fetchUserById(req.user.userId);
  const userWithoutPassword = mapUserRow(user);
    res.status(StatusCodes.OK).json({user: userWithoutPassword})

}

export const getApplicationStats = async (req, res) => {
  const { count: users, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  if (usersError) throw usersError;

  const { count: product, error: productError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  if (productError) throw productError;

    res.status(StatusCodes.OK).json({users, product})
}

export const updateUser = async (req, res) => {
    const obj = {...req.body};
    delete obj.password

  const payload = {
    name: obj.name,
    last_name: obj.lastName,
    email: obj.email,
    username: obj.username,
    address: obj.address || obj.location,
  };

  const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

  const { error } = await supabase
    .from('users')
    .update(cleanPayload)
    .eq('id', req.user.userId);

  if (error) throw error;

    res.status(StatusCodes.OK).json({msg: 'update user'})
}

export const addFavorites = async (req, res) => {
    
  const user = await fetchUserById(req.user.userId);
  const product = await fetchProductByExternalId(req.params.id);

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
  }

  let favorites = [...(user.favorites || [])];

  if (!favorites.includes(product.id)) {
    favorites.push(product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ favorites })
      .eq('id', user.id);
    if (userError) throw userError;

    const { error: productError } = await supabase
      .from('products')
      .update({ hearts: (product.hearts || 0) + 1 })
      .eq('id', product.id);
    if (productError) throw productError;

    const userModelId = Number(user.usermodel_id);
    const productModelId = Number(product.product_model_id);
        registerInteraction(userModelId, productModelId, 'favorite');

        res.status(StatusCodes.OK).json({msg: 'product added to favorites'})

    }
    else {
    favorites = favorites.filter((id) => id !== product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ favorites })
      .eq('id', user.id);
    if (userError) throw userError;

    const { error: productError } = await supabase
      .from('products')
      .update({ hearts: Math.max((product.hearts || 0) - 1, 0) })
      .eq('id', product.id);
    if (productError) throw productError;

        res.status(StatusCodes.OK).json({msg: 'product removed from favorites'})
    }

}

export const removeFavorites = async ( req, res) => {
    try{

    const user = await fetchUserById(req.user.userId);
    const product = await fetchProductByExternalId(req.params.id);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
    }

    const favorites = (user.favorites || []).filter((id) => id !== product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ favorites })
      .eq('id', user.id);
    if (userError) throw userError;

    const { error: productError } = await supabase
      .from('products')
      .update({ hearts: Math.max((product.hearts || 0) - 1, 0) })
      .eq('id', product.id);
    if (productError) throw productError;

        res.status(StatusCodes.OK).json({msg: 'product removed from favorites'})

    } catch ( error ){
        console.log(error)
    }


}
export const userView = async (req, res) => {
  // Responder inmediatamente, registrar la interacción en background
  res.status(StatusCodes.OK).json({ msg: 'ok' });

  try {
    const user = await fetchUserById(req.user.userId);
    const product = await fetchProductByExternalId(req.params.id);
    if (user && product) {
      const userModelId = Number(user.usermodel_id);
      const productModelId = Number(product.product_model_id);
      registerInteraction(userModelId, productModelId, 'view'); // sin await
    }
  } catch(error) {
    console.log('Error registering view interaction:', error);
  }
}

export const getFavorites = async (req, res) => {
    try {
    const user = await fetchUserById(req.user.userId);
    const favorites = await fetchProductsByIds(user.favorites || []);
    res.status(StatusCodes.OK).json({ favorites });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error retrieving favorites', error });
    }


}

export const addRead = async (req, res) => {

  const user = await fetchUserById(req.user.userId);
  const product = await fetchProductByExternalId(req.params.id);

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
  }

  let readHistory = [...getReadHistory(user)];

  if (!readHistory.includes(product.id)) {
    readHistory.push(product.id);

    await updateReadHistory(user.id, readHistory);

    const userModelId = Number(user.usermodel_id);
    const productModelId = Number(product.product_model_id);
      registerInteraction(userModelId, productModelId, 'read');
        res.status(StatusCodes.OK).json({msg: 'product added to Library'})

    }
    else {
    readHistory = readHistory.filter((id) => id !== product.id);

    await updateReadHistory(user.id, readHistory);

        res.status(StatusCodes.OK).json({msg: 'product removed from Library'})
    }


}

export const removeRead = async ( req, res) => {

    try{

    const user = await fetchUserById(req.user.userId);
    const product = await fetchProductByExternalId(req.params.id);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
    }

    const readHistory = getReadHistory(user).filter((id) => id !== product.id);

    await updateReadHistory(user.id, readHistory);

        res.status(StatusCodes.OK).json({msg: 'product removed from read'})

    } catch ( error ){
        console.log(error)
    }

}

export const getRead = async (req, res) => {
    try {
    const user = await fetchUserById(req.user.userId);
    const readHistory = await fetchProductsByIds(getReadHistory(user));
    res.status(StatusCodes.OK).json({ readHistory });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error retrieving Library', error });
    }
}

export const addWishlist = async (req, res) => {
  const user = await fetchUserById(req.user.userId);
  const product = await fetchProductByExternalId(req.params.id);

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
  }

  let wishlist = [...(user.wishlist || [])];

  if (!wishlist.includes(product.id)) {
    wishlist.push(product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ wishlist })
      .eq('id', user.id);
    if (userError) throw userError;

    const userModelId = Number(user.usermodel_id);
    const productModelId = Number(product.product_model_id);
      registerInteraction(userModelId, productModelId, 'wishlist');
        res.status(StatusCodes.OK).json({msg: 'Product added to Wishlist'})

    }
    else {
    wishlist = wishlist.filter((id) => id !== product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ wishlist })
      .eq('id', user.id);
    if (userError) throw userError;

        res.status(StatusCodes.OK).json({msg: 'product removed from Wishlist'})
    }

}

export const removeWishlist = async ( req, res) => {

    try{

    const user = await fetchUserById(req.user.userId);
    const product = await fetchProductByExternalId(req.params.id);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
    }

    const wishlist = (user.wishlist || []).filter((id) => id !== product.id);

    const { error: userError } = await supabase
      .from('users')
      .update({ wishlist })
      .eq('id', user.id);
    if (userError) throw userError;

        res.status(StatusCodes.OK).json({msg: 'product removed from read'})

    } catch ( error ){
        console.log(error)
    }

}

export const getWishlist = async (req, res) => {
    try {
    const user = await fetchUserById(req.user.userId);
    const wishlist = await fetchProductsByIds(user.wishlist || []);
    res.status(StatusCodes.OK).json({ wishlist });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error retrieving Wishlist', error });
    }

}

export const addCart = async (req, res) => {
  const { productId } = req.body;
  const user = await fetchUserById(req.user.userId);
  const product = await fetchProductByExternalId(productId);

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Producto no encontrado' });
  }

  //  Verificar stock
  if (product.stock <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Producto sin stock disponible' });
  }

  // Comparar con .toString() para que funcione con ObjectIds
  const cartData = [...(user.cart_data || [])];
  const alreadyInCart = cartData.includes(product.id);

  if (!alreadyInCart) {
    cartData.push(product.id);
    const { error } = await supabase
      .from('users')
      .update({ cart_data: cartData })
      .eq('id', user.id);

    if (error) throw error;
  }

  res.status(StatusCodes.OK).json({ msg: 'Producto agregado al carrito' });
}

export const getCart = async (req, res) => {
  const user = await fetchUserById(req.user.userId);
  const cart = await fetchProductsByIds(user.cart_data || []);
  res.status(StatusCodes.OK).json({ cart });
}

export const removeCart = async (req, res) => {
  const { productId } = req.body;
  const user = await fetchUserById(req.user.userId);

  const cartData = (user.cart_data || []).filter(
    (id) => id !== productId
  );

  const { error } = await supabase
    .from('users')
    .update({ cart_data: cartData })
    .eq('id', user.id);

  if (error) throw error;

  res.status(StatusCodes.OK).json({ msg: 'Producto removido del carrito' });
};

export const getRecommendedComics = async (req, res) => {

  try {

      const user = await fetchUserById(req.user.userId);
      const userProductIds = getUserProductIds(user);

      const { data: userProducts, error: userProductsError } = await supabase
        .from('products')
        .select('*')
        .in('id', userProductIds.length ? userProductIds : [EMPTY_TITLE]);

      if (userProductsError) throw userProductsError;

      const topCategory = getTopCategory(userProducts || []);

      let products = [];

      if (topCategory) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', topCategory)
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;

        products = (data || [])
          .filter((product) => !userProductIds.includes(product.id))
          .slice(0, 6)
          .map(mapProductRow);

        if (products.length === 0) {
          products = (data || []).slice(0, 6).map(mapProductRow);
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        products = (data || []).map(mapProductRow);
      }

      res.status(StatusCodes.OK).json({
        category: topCategory,
        products,
      })
    
  } catch (error) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message})
    
  }
};

// ── Admin Endpoints para gestionar usuarios ───────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;

    const users = (data || []).map(user => ({
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
    
    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error al obtener usuarios', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;

    const user = {
      id: data.id,
      name: data.name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      address: data.address,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error al obtener usuario', error: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, email, address, role } = req.body;

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (last_name !== undefined) payload.last_name = last_name;
    if (email !== undefined) payload.email = email;
    if (address !== undefined) payload.address = address;
    if (role !== undefined) payload.role = role;

    if (Object.keys(payload).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'No hay campos para actualizar' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;

    const user = {
      id: data.id,
      name: data.name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      address: data.address,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    res.status(StatusCodes.OK).json({ msg: 'Usuario actualizado', user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error al actualizar usuario', error: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    res.status(StatusCodes.OK).json({ msg: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error al eliminar usuario', error: error.message });
  }
}









