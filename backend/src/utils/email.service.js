import "../config/env.js";
import nodemailer from 'nodemailer';

// Create a transporter
// If credentials are provided, use them. Otherwise, we might use a testing account or just log.
const clean = (val) => val?.trim().replace(/^["']|["']$/g, '');

const createTransporter = () => {
    const host = clean(process.env.EMAIL_HOST);
    const user = clean(process.env.EMAIL_USERNAME);
    const pass = clean(process.env.EMAIL_PASSWORD);
    const port = parseInt(clean(process.env.EMAIL_PORT) || '587');

    if (host && user && pass) {
        console.log(`✅ Creating real SMTP transporter for ${host}`);
        return nodemailer.createTransport({
            host,
            port,
            secure: false,
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else {
        console.log("⚠️ No SMTP credentials found. Email sending will be simulated (logged to console).");
        return null;
    }
};

const transporter = createTransporter();

export const sendOrderStatusEmail = async (to, orderId, status) => {
    const fromEmail = clean(process.env.EMAIL_FROM) || 'no-reply@artisanat.ma';
    const subject = `Mise à jour de votre commande #${orderId.toString().slice(-6)}`;
    const text = `Bonjour,\n\nLe statut de votre commande #${orderId} a été mis à jour.\n\nNouveau statut : ${status}\n\nMerci de votre confiance,\nL'équipe Artisanat.`;

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #c2410c;">Mise à jour de votre commande</h2>
            <p>Bonjour,</p>
            <p>Le statut de votre commande <strong>#${orderId.toString().slice(-6)}</strong> a été mis à jour.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;">Nouveau statut : <span style="font-weight: bold; color: #ea580c;">${status}</span></p>
            </div>
            <p>Merci de votre confiance,</p>
            <p><em>L'équipe Artisanat</em></p>
        </div>
    `;

    try {
        if (transporter) {
            const info = await transporter.sendMail({
                from: `"Artisanat Platform" <${fromEmail}>`,
                to,
                subject,
                text,
                html,
            });
            console.log(`📧 Email sent: ${info.messageId}`);
            return true;
        } else {
            // Simulation mode
            console.log("---------------------------------------------------");
            console.log("📧 [EMAIL SIMULATION]");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            console.log("---------------------------------------------------");
            return true;
        }
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};
