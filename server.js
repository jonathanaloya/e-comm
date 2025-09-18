import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './src/config/database.js';
import userRouter from './src/routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import categoryRouter from './src/routes/category.js';
import uploadRouter from './src/routes/upload.js';
import subCategoryRouter from './src/routes/subCategory.js';
import productRouter from './src/routes/productRoutes.js';
import cartRouter from './src/routes/cartRoutes.js';
import orderRouter from './src/routes/orderRoutes.js';
import addressRouter from './src/routes/addressRoutes.js';
import adminRouter from './src/routes/adminRoutes.js';
import newsletterRouter from './src/routes/newsletterRoutes.js';
import supportRouter from './src/routes/supportRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://e-comm-rho-five.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(morgan());
app.use(helmet({
  crossOriginResourcePolicy: false
}
));

// Define routes
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', uploadRouter)
app.use('/api/subcategory', subCategoryRouter)

app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/address', addressRouter)
app.use('/api/admin', adminRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/support', supportRouter)


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
