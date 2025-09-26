import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import connectDB from './config/database.js'
import { generalLimiter, securityHeaders, sanitizeInput } from './middleware/security.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import userRouter from './routes/userRoutes.js'
import categoryRouter from './routes/categoryRoutes.js'
import uploadRouter from './routes/uploadRoutes.js'
import subCategoryRouter from './routes/subCategoryRoutes.js'
import productRouter from './routes/productRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import addressRouter from './routes/addressRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import supportRouter from './routes/supportRoutes.js'
import adminRouter from './routes/adminRoutes.js'

dotenv.config()

const app = express()
// Security middleware
app.use(generalLimiter)
app.use(securityHeaders)
app.use(sanitizeInput)

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    optionsSuccessStatus: 200
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan('combined'))

const PORT = 8080 || process.env.PORT

app.get("/",(request,response)=>{
    response.json({
        message : `Server is running on port ${PORT}`
    })
})

app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/file',uploadRouter)
app.use('/api/subcategory',subCategoryRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)
app.use('/api/support',supportRouter)
app.use('/api/order/admin',adminRouter)
app.use('/api/user/admin',adminRouter)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })
}).catch(err => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
})

export default app
