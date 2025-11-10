import * as nodemailer from 'nodemailer';

export const createNodemailerTransporter = () => {
  const useSecure = process.env.EMAIL_PORT === '465';

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: useSecure, // ! true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    //  ! Use a pooled connection and rate limiting to avoid bursts that can
    // ! trigger provider throttling or spam heuristics.
    pool: true,
    maxConnections: parseInt(process.env.EMAIL_POOL_MAX_CONNECTIONS || '5'),
    maxMessages: parseInt(process.env.EMAIL_POOL_MAX_MESSAGES || '100'),
    rateDelta: parseInt(process.env.EMAIL_RATE_DELTA_MS || '1000'),
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '5'),
    tls: {
      // ? Keep current default behavior; enable strict mode via env when needed.
      rejectUnauthorized:
        process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === 'true' ? true : false,
    },
  });
};

export const senderInfo = {
  email: process.env.EMAIL_USER || 'noreply@marmaratravels.com',
  name: 'noreply-marmaratravels',
};