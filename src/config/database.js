import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Database connection failed:', error);
        // Don't exit immediately, let the app start without DB
        console.log('Starting server without database connection...');
    }
};

export default connectDB;
