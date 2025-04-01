import express from 'express';
import { getProducts, addProduct} from '../controllers/productController.js';
import { Router } from 'express';
 const productRouter = Router()
// Route to get all products (product listing)
  // This will call the getProducts function
productRouter.post('/products', addProduct);

export default productRouter