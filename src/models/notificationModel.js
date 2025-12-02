import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['signup', 'order', 'support', 'user', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
})

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification