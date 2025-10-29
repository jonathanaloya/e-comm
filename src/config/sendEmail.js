import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `Fresh Katale <${process.env.FROM_EMAIL || 'info@freshkatale.com'}>`,
            to: [sendTo],
            subject: subject,
            html: html,
        });

        if (error) {
            return { error };
        }
        return { success: true, messageId: data.id };
    } catch (error) {
        return { error };
    }
}

export default sendEmail;