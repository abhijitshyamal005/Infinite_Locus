import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { gmailContent } from './emailTemplate.js';
dotenv.config();

const normalizeBaseUrl = (url) => {
    if (!url) return url;
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const getBackendApiBaseUrl = () => {
    // Prefer explicit URL for emails (must be reachable from user's device)
    // Example: https://your-domain.com/api/v1
    const fromEnv = normalizeBaseUrl(process.env.BACKEND_URL);
    if (fromEnv) return fromEnv;

    // Safe local fallback for development
    const port = process.env.PORT || 8080;
    return `http://localhost:${port}/api/v1`;
};



export const generateverificationToken = (email) => {
    return jwt.sign({ email: email }, secret_key, { expiresIn: '1d' })
}


export const sendVerificationEmail = async (recipientEmail, verificationToken, username) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }

        })

        const backendUrl = getBackendApiBaseUrl();
        const emailcontent = gmailContent(verificationToken, username, backendUrl);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: recipientEmail,
            subject: 'Email Verification',
            html: emailcontent
        })

        console.log("Verification email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}
