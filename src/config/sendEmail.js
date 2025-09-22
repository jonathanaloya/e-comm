import dotenv from 'dotenv';
dotenv.config();

// Placeholder email function - replace with your preferred email service
const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        console.log('Email would be sent to:', sendTo);
        console.log('Subject:', subject);
        // Add your email service implementation here
        return { success: true };
    } catch (error) {
        console.error('Email error:', error);
        return { error };
    }
}

export default sendEmail;