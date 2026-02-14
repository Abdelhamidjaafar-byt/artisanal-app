import dotenv from 'dotenv';
import { sendOrderStatusEmail } from './src/utils/email.service.js';

dotenv.config();

const testOrderEmail = async () => {
    try {
        console.log('Testing Order Email (Standardized)...');
        console.log(`Env Host: [${process.env.EMAIL_HOST}]`);
        console.log(`Env User: [${process.env.EMAIL_USERNAME}]`);
        const success = await sendOrderStatusEmail(
            process.env.EMAIL_FROM || 'maryam.elrhazi10@gmail.com',
            '123456789',
            'En cours de préparation'
        );
        if (success) {
            console.log('SUCCESS: Order email sent (or simulated correctly)!');
        } else {
            console.error('FAILURE: Order email failed.');
        }
    } catch (error) {
        console.error('FAILURE:', error);
    }
};

testOrderEmail();
