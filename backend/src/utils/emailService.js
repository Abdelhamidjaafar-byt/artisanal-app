import "../config/env.js";
import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer.
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient email.
 * @param {string} options.subject - Email subject.
 * @param {string} options.message - Email body.
 */
const cleanEnv = (val) => {
    if (!val) return '';
    return val.trim().replace(/^["']|["']$/g, '');
};

const sendEmail = async (options) => {
    const host = cleanEnv(process.env.EMAIL_HOST);
    const port = parseInt(cleanEnv(process.env.EMAIL_PORT) || '2525');
    const user = cleanEnv(process.env.EMAIL_USERNAME);
    const pass = cleanEnv(process.env.EMAIL_PASSWORD);
    const fromEmail = cleanEnv(process.env.EMAIL_FROM) || 'hello@artisanal.com';

    console.log(`SMTP Debug: connecting to ${host} as ${user}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `Artisanal Platform <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
