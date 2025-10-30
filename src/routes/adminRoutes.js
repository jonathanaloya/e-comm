import { Router } from 'express';
import {
    getAllOrdersController,
    updateOrderStatusController,
    getAllUsersController,
    getOrderTrackingController,
    adminLoginController,
    getNotificationsController,
    markNotificationAsReadController,
    deleteNotificationController
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { admin } from '../middleware/admin.js';

const adminRouter = Router();

// Admin authentication
adminRouter.post('/login', adminLoginController);

// Admin notification routes
adminRouter.get('/notifications', authMiddleware, admin, getNotificationsController);
adminRouter.put('/notifications/:id/read', authMiddleware, admin, markNotificationAsReadController);
adminRouter.delete('/notifications/:id', authMiddleware, admin, deleteNotificationController);

// Admin order management routes
adminRouter.get('/all-orders', authMiddleware, admin, getAllOrdersController);
adminRouter.put('/update-status', authMiddleware, admin, updateOrderStatusController);
adminRouter.get('/all-users', authMiddleware, admin, getAllUsersController);

// Order tracking route (can be accessed by users too)
adminRouter.get('/tracking', getOrderTrackingController);

export default adminRouter;