import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { admin } from '../middleware/admin.js';
import { csrfProtection } from '../middleware/csrfProtection.js';
import { AddCategory, deleteCategory, getCategory, updateCategory } from '../controllers/categoryController.js';

const categoryRouter = Router();

categoryRouter.post('/add-category', authMiddleware, admin, csrfProtection, AddCategory);

categoryRouter.get('/get-category', getCategory);

categoryRouter.put('/update-category', authMiddleware, admin, csrfProtection, updateCategory);

categoryRouter.delete('/delete-category', authMiddleware, admin, csrfProtection, deleteCategory);

export default categoryRouter