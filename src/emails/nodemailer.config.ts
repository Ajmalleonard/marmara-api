import * as nodemailer from 'nodemailer';

export const createNodemailerTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

export const senderInfo = {
  email: process.env.EMAIL_USER || 'noreply@marmaratravels.com',
  name: 'Marmara Travel',
};