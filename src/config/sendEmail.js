import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);

if(!process.env.RESEND_API_KEY){
    console.log("Resend API key:", process.env.RESEND_API_KEY);
}

const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'FreshKatale <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
          });

          if (error) {
            return console.error({ error });
          }
          return data
    } catch (error) {
        return console.error({ error });
    }
    
}

export default sendEmail;