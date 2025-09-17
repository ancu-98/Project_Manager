import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SEND_GRID_API);

const fromEmail = process.env.FROM_EMAIL;

export const sendEmail = async (to, subject, html) => {
    const msg = {
        to,
        from: `ProjectHub <${fromEmail}`,
        subject,
        html,
    }

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');

        return true;

    } catch(error) {
        console.log('Error sending email:', error);

        return false;
    }
}