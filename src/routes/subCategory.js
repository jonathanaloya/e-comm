import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from '../controllers/subCategory.js';
import { get } from 'mongoose';

const subCategoryRouter = Router();

subCategoryRouter.post('/create', authMiddleware, AddSubCategoryController);

subCategoryRouter.post('/get', getSubCategoryController)

subCategoryRouter.put('/update', authMiddleware, updateSubCategoryController)

subCategoryRouter.delete('/delete', authMiddleware, deleteSubCategoryController)

export default subCategoryRouter