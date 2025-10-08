import { Router } from 'express';
import { 
    getAllOrdersController, 
    updateOrderStatusController, 
    getAllUsersController,
    getOrderTrackingController,
    adminLoginController
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const adminRouter = Router();

// Admin authentication
adminRouter.post('/login', adminLoginController);

// Admin order management routes
adminRouter.get('/all-orders', authMiddleware, getAllOrdersController);
adminRouter.put('/update-status', authMiddleware, updateOrderStatusController);
adminRouter.get('/all-users', authMiddleware, getAllUsersController);

// Order tracking route (can be accessed by users too)
adminRouter.get('/tracking', getOrderTrackingController);

export default adminRouter;