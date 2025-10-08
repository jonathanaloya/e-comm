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

// Temporary endpoint to create test admin user
adminRouter.post('/create-test-admin', async (req, res) => {
    try {
        const bcrypt = await import('bcryptjs');
        const User = (await import('../models/userModel.js')).default;
        
        const email = 'jonathanaloya27@gmail.com';
        const password = '199019';
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'User already exists', user: existingUser.email });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name: 'Jonathan Aloya',
            email: email,
            password: hashedPassword,
            verify_email: true,
            status: 'Active'
        });
        
        await newUser.save();
        
        res.json({ message: 'Test admin user created successfully', email: email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin order management routes
adminRouter.get('/all-orders', authMiddleware, getAllOrdersController);
adminRouter.put('/update-status', authMiddleware, updateOrderStatusController);
adminRouter.get('/all-users', authMiddleware, getAllUsersController);

// Order tracking route (can be accessed by users too)
adminRouter.get('/tracking', getOrderTrackingController);

export default adminRouter;