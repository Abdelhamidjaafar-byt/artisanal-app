import dotenv from 'dotenv';
import sendEmail from './src/utils/emailService.js';

dotenv.config();

const clean = (v) => v?.trim().replace(/^["']|["']$/g, '');

const testEmailConfig = async () => {
    try {
        const u = clean(process.env.EMAIL_USERNAME);
        const p = clean(process.env.EMAIL_PASSWORD);
        console.log(`Testing with user: [${u}]`);

        await sendEmail({
            email: u.includes('@') ? u : 'test@artisanal.com',
            subject: 'SMTP Final Test',
            message: 'Success!'
        });

        console.log('SUCCESS: SMTP is working!');
    } catch (error) {
        console.error('FAILURE:', error.message);
        process.exit(1);
    }
};

testEmailConfig();
