import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
import { gmailContent } from './emailTemplate.js';
dotenv.config();

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendVerificationEmail = async (recipientEmail, verificationCode, username) => {
    try {
        console.log('Sending OTP email to:', recipientEmail, 'Code:', verificationCode);

        const emailContent = gmailContent(verificationCode, username);

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = 'Email Verification - Your OTP Code';
        sendSmtpEmail.htmlContent = emailContent;
        sendSmtpEmail.sender = {
            name: 'Infinite Locus',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
        };
        sendSmtpEmail.to = [{ email: recipientEmail }];
        sendSmtpEmail.replyTo = {
            email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('OTP email sent successfully via Brevo:', data);

    } catch (error) {
        console.error('Error sending verification email via Brevo:', error);
        throw error;
    }
}
