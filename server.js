import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import userRouter from './src/routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import categoryRouter from './src/routes/category.js';
import uploadRouter from './src/routes/upload.js';
import subCategoryRouter from './src/routes/subCategory.js';
import productRouter from './src/routes/productRoutes.js';
import cartRouter from './src/routes/cartRoutes.js';
dotenv.config();

const app = express();
app.use(cors(
  {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
));
app.use(cookieParser());
app.use(express.json());
app.use(morgan());
app.use(helmet({
  crossOriginResourcePolicy: false
}
));



// Define routes


app.get('/', (req, res) => {
  res.send('Hello World!');
})



app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', uploadRouter)
app.use('/api/subcategory', subCategoryRouter)

app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
