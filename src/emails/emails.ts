import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPATE,
  BOOKING_CONFIRMATION_EMAIL_TEMPLATE,
  NEW_BOOKING_EMAIL_TEMPLATE,
  feedback_Mail,
} from './emailTemplates.js';
import { mailtrapClient, sender } from './mailtrap.config.js';

export const sendVerificationEmail = async (
  email: string,
  verificationToken: any,
) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken,
      ),
      category: 'Email Verification',
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.log(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendFeedback = async (email, message) => {
  const recipient = [
    {
      email: process.env.Admin,
    },
    {
      email: process.env.Developer,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Support email from marmaraholidays',
      html: feedback_Mail
        .replace('{email}', email)
        .replace('{usermail}', email)
        .replace('{message}', message),
      category: 'Feedback',
    });
    console.log('Email sent successfully', response);
  } catch (error) {
    console.log(`Error sending Feedback`, error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  let Mail = WELCOME_EMAIL_TEMPATE.replace('{userName}', name);
  Mail = Mail.replace('{userEmail}', email);

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Welcome to Marmaraholidays',
      category: 'Welcome emails',

      html: Mail,
    });

    console.log('Welcome email sent successfully', response);
  } catch (error) {
    console.log(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
      category: 'Password Reset',
    });
  } catch (error) {
    console.log(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Password Reset Successful',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: 'Password Reset',
    });

    console.log('Password reset email sent successfully', response);
  } catch (error) {
    console.log(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

export const sendBookingConfirmationEmail = async (email, bookingData) => {
  const recipient = [{ email }];

  try {
    let emailContent = BOOKING_CONFIRMATION_EMAIL_TEMPLATE;

    emailContent = emailContent.replace('{name}', bookingData.name);
    emailContent = emailContent.replace('{id}', bookingData.packageId);
    emailContent = emailContent.replace(
      '{packageName}',
      bookingData.packageName,
    );
    emailContent = emailContent.replace('{startDate}', bookingData.startDate);
    emailContent = emailContent.replace('{endDate}', bookingData.endDate);
    emailContent = emailContent.replace('{adults}', bookingData.adults);
    emailContent = emailContent.replace('{children}', bookingData.children);
    emailContent = emailContent.replace('{Infants}', bookingData.infants);
    emailContent = emailContent.replace('{pets}', bookingData.pets);
    emailContent = emailContent.replace('{price}', bookingData.price);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Booking Confirmation - Marmara Holidays',
      html: emailContent,
      category: 'Booking Confirmation',
    });

    console.log('Booking confirmation email sent successfully', response);
    return response;
  } catch (error) {
    console.log(`Error sending booking confirmation email`, error);
  }
};
export const sendAdminBookingEmail = async (bookingData) => {
  const recipient = [
    {
      email: process.env.Developer,
    },
    {
      email: process.env.Admin,
    },
  ];

  try {
    let emailContent = NEW_BOOKING_EMAIL_TEMPLATE;

    emailContent = emailContent.replace('{name}', bookingData.name);
    emailContent = emailContent.replace('{id}', bookingData.packageId);
    emailContent = emailContent.replace(
      '{packageName}',
      bookingData.packageName,
    );
    emailContent = emailContent.replace('{startDate}', bookingData.startDate);
    emailContent = emailContent.replace('{email}', bookingData.email);
    emailContent = emailContent.replace('{endDate}', bookingData.endDate);
    emailContent = emailContent.replace('{adults}', bookingData.adults);
    emailContent = emailContent.replace('{children}', bookingData.children);
    emailContent = emailContent.replace('{Infants}', bookingData.infants);
    emailContent = emailContent.replace('{pets}', bookingData.pets);
    emailContent = emailContent.replace('{price}', bookingData.price);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Booking Confirmation - Marmara Holidays',
      html: emailContent,
      category: 'New Booking',
    });

    console.log('Booking confirmation email sent successfully', response);
    return response;
  } catch (error) {
    console.log(`Error sending booking confirmation email`, error);
  }
};
