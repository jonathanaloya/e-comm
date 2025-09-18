import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  requireAdmin,
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails,
  getAllUsers,
  updateUser,
  getSalesAnalytics
} from '../controllers/adminController.js';

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  updateProductStock,
  getInventoryReport
} from '../controllers/adminProductController.js';

const adminRouter = Router();

// Apply authentication and admin middleware to all routes
adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

// Dashboard and Statistics
adminRouter.get('/stats', getAdminStats);
adminRouter.get('/analytics/sales', getSalesAnalytics);

// Order Management
adminRouter.get('/orders', getAllOrders);
adminRouter.get('/orders/:orderId', getOrderDetails);
adminRouter.put('/orders/:orderId/status', updateOrderStatus);

// User Management
adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:userId', updateUser);

// Product Management
adminRouter.get('/products', getAllProducts);
adminRouter.post('/products', createProduct);
adminRouter.get('/products/:productId', getProductDetails);
adminRouter.put('/products/:productId', updateProduct);
adminRouter.delete('/products/:productId', deleteProduct);
adminRouter.put('/products/:productId/stock', updateProductStock);

// Inventory Management
adminRouter.get('/inventory/report', getInventoryReport);

export default adminRouter;
