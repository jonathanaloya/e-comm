import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { AddCategory, deleteCategory, getCategory, updateCategory } from '../controllers/categoryController.js';

const categoryRouter = Router();

categoryRouter.post('/add-category', authMiddleware, AddCategory);

categoryRouter.get('/get-category', getCategory);

categoryRouter.put('/update-category', authMiddleware, updateCategory);

categoryRouter.delete('/delete-category', authMiddleware, deleteCategory);

export default categoryRouter