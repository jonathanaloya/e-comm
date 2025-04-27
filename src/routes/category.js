import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { AddCategory, getCategory } from '../controllers/categoryController.js';

const categoryRouter = Router();

categoryRouter.post('/add-category', authMiddleware, AddCategory);
categoryRouter.get('/get-category', getCategory);

export default categoryRouter