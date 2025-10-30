import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { admin } from '../middleware/admin.js';
import { csrfProtection } from '../middleware/csrfProtection.js';
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from '../controllers/subCategory.js';
import { get } from 'mongoose';

const subCategoryRouter = Router();

subCategoryRouter.post('/create', authMiddleware, admin, csrfProtection, AddSubCategoryController);

subCategoryRouter.post('/get', getSubCategoryController)

subCategoryRouter.put('/update', authMiddleware, admin, csrfProtection, updateSubCategoryController)

subCategoryRouter.delete('/delete', authMiddleware, admin, csrfProtection, deleteSubCategoryController)

export default subCategoryRouter