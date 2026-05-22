import { Router } from 'express';
import { createOrder, getMyOrders, getSalesReport, getAdminOrder, cancelOrder } from '../Controllers/orderController.js';
import { authorizePermissions } from '../Middleware/authMiddleware.js';

const router = Router();

// Usuario: crear orden (checkout) y ver sus facturas
router.post('/checkout', createOrder);
router.get('/my-orders', getMyOrders);
router.post('/:orderId/cancel', cancelOrder);

// Admin: reporte de ventas y detalle de orden
router.get('/admin/report', authorizePermissions('admin'), getSalesReport);
router.get('/admin/order/:orderId', authorizePermissions('admin'), getAdminOrder);

export default router;
