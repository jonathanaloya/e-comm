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

const adminRouter = Router();

// Admin authentication
adminRouter.post('/login', adminLoginController);

// Admin notification routes
adminRouter.get('/notifications', authMiddleware, getNotificationsController);
adminRouter.put('/notifications/:id/read', authMiddleware, markNotificationAsReadController);
adminRouter.delete('/notifications/:id', authMiddleware, deleteNotificationController);

// Admin order management routes
adminRouter.get('/all-orders', authMiddleware, getAllOrdersController);
adminRouter.put('/update-status', authMiddleware, updateOrderStatusController);
adminRouter.get('/all-users', authMiddleware, getAllUsersController);

// Order tracking route (can be accessed by users too)
adminRouter.get('/tracking', getOrderTrackingController);

export default adminRouter;