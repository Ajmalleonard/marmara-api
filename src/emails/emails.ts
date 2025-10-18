import { CreateContactDto } from '@/contact/dto/create-contact.dto';
import {
  BOOKING_CONFIRMATION_EMAIL_TEMPLATE,
  feedback_Mail,
  NEW_BOOKING_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_UPDATE_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPATE,
  FLIGHT_BOOKING_CONFIRMATION_EMAIL_TEMPLATE,
  FLIGHT_BOOKING_CANCELLATION_EMAIL_TEMPLATE,
} from './emailTemplates';
import { createNodemailerTransporter, senderInfo } from './nodemailer.config';

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationCode,
      ),
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendFeedbackEmail = async (
  email: string,
  message: string,
  usermail: string,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Feedback from user',
      html: feedback_Mail
        .replace('{email}', email)
        .replace('{message}', message)
        .replace('{usermail}', usermail),
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending feedback`, error);
    throw new Error(`Error sending feedback email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Welcome to Marmara Holidays',
      html: WELCOME_EMAIL_TEMPATE.replace('{userName}', name).replace(
        '{userEmail}',
        email,
      ),
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email: string) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Password Reset Successful',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

export const sendBookingConfirmationEmail = async (
  email: string,
  bookingDetails: any,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'Booking Confirmation - Marmara Holidays',
      html: BOOKING_CONFIRMATION_EMAIL_TEMPLATE,
    });

    console.log('Booking confirmation email sent successfully', response);
  } catch (error) {
    console.error(`Error sending booking confirmation email`, error);
    throw new Error(`Error sending booking confirmation email: ${error}`);
  }
};

export const sendAdminBookingEmail = async (
  adminEmail: string,
  bookingDetails: any,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: adminEmail,
      subject: 'New Booking Received - Marmara Holidays',
      html: `
        <h2>New Booking Received</h2>
        <p>A new booking has been received with the following details:</p>
        <pre>${JSON.stringify(bookingDetails, null, 2)}</pre>
      `,
    });

    console.log('Admin booking email sent successfully', response);
  } catch (error) {
    console.error(`Error sending admin booking email`, error);
    throw new Error(`Error sending admin booking email: ${error}`);
  }
};

export const sendAdminContactEmail = async (data: CreateContactDto) => {
  console.log('Sending contact request email', data);

  const recipient = [
    {
      email: 'ajmalmaker@icloud.com',
    },
  ];

  // Build your custom template by inserting contact detail fields
  const htmlTemplate = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link
      rel="preload"
      as="image"
      href="https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/logo.svg"
    />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body
    style='background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,
      "Helvetica Neue",Ubuntu,sans-serif; margin: 0; padding: 0'
  >
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width: 600px; background-color:#ffffff;
        margin: 0 auto; padding: 40px; border-radius: 60px"
    >
      <tbody>
        <tr style="width:100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="padding: 0 16px"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      alt="Marmara Logo"
                      height="100"
                      src="https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/logo.svg"
                      style="display:block;outline:none;border:none;text-decoration:none;margin-bottom:24px"
                    />
                    <hr
                       /   style="width:100%;border:none;border-top:1px solid #e6ebf1;margin:20px 0"
                    />
                    <h2 style="font-weight:light, font-size:16px;color:#3B2AFAFF;margin:16px 0 24px 0;">
                      New Contact Request
                    </h2>
                    <div style="font-size:17px;line-height:28px;color:#525f7f;">
                      <p style="margin: 0 0 24px 0;">
                        <strong>First Name:</strong> ${data.first_name}
                      </p>
                      <p style="margin: 0 0 24px 0;">
                        <strong>Last Name:</strong> ${data.last_name}
                      </p>
                      <p style="margin: 0 0 24px 0;">
                        <strong>Email:</strong> ${data.email}
                      </p>
                      <p style="margin: 0 0 24px 0;">
                        <strong>Help:</strong> ${data.help}
                      </p>
                      ${
                        data.trip_type
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>Trip Type:</strong> ${data.trip_type}
                             </p>`
                          : ''
                      }
                      ${
                        data.class_type
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>Class Type:</strong> ${data.class_type}
                             </p>`
                          : ''
                      }
                      ${
                        data.departure_date
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>Departure Date:</strong> ${data.departure_date}
                             </p>`
                          : ''
                      }
                      ${
                        data.return_date
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>Return Date:</strong> ${data.return_date}
                             </p>`
                          : ''
                      }
                      ${
                        data.from_location
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>From:</strong> ${data.from_location}
                             </p>`
                          : ''
                      }
                      ${
                        data.to_location
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>To:</strong> ${data.to_location}
                             </p>`
                          : ''
                      }
                      ${
                        data.info
                          ? `<p style="margin: 0 0 24px 0;">
                               <strong>Additional Info:</strong> ${data.info}
                             </p>`
                          : ''
                      }
                    </div>
                    <hr
                      style="width:100%;border:none;border-top:1px solid #e6ebf1;margin:20px 0"
                    />
                    <p style="font-size:14px; color:#8898aa;margin:0;padding-top:8px;">
                      Marmara Travel — Bringing you the best travel services
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;

  try {
    const transporter = createNodemailerTransporter();
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: 'info@marmaraholidays.com',
      subject: 'New Contact Request',
      html: htmlTemplate,
    });
    console.log('Contact request email sent successfully', response);
    return response;
  } catch (error) {
    console.log('Error sending contact request email', error);
    throw new Error(`Error sending contact request email: ${error}`);
  }
};

export const sendClientContactConfirmationEmail = async (
  email: string,
  caseRef: string,
) => {
  const recipient = [{ email }];

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<body style="
  background-color:#f6f9fc;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;
  margin:0;
  padding:0;
">
  <table
    align="center"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="max-width:600px; background-color:#ffffff; margin:40px auto; border-radius:8px; padding:24px"
  >
    <tr>
      <td style="color:#525f7f; font-size:17px; line-height:24px;">
        <img
          alt="Marmara Logo"
          height="34"
          src="https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/logo.svg"
          style="display:block; margin-bottom:24px"
        />
        <hr style="border:none; border-top:1px solid #e6ebf1; margin:24px 0" />
        <h2 style="color:#4b42ad; margin:16px 0 24px 0;">
          Your Request Has Been Received
        </h2>
        <p style="margin:0 0 24px 0;">
          Hello! We’ve received your request, and our team will get in touch soon.
          Your case reference number is <strong>${caseRef}</strong>. We appreciate you choosing Marmara Travel.
        </p>
        <p style="margin:0;">
          We look forward to assisting you.
        </p>
        <hr style="border:none; border-top:1px solid #e6ebf1; margin:24px 0" />
        <p style="font-size:14px; color:#8898aa; margin:0;">
          Marmara Travel — Bringing you the best travel services
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const transporter = createNodemailerTransporter();
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: 'We Received Your Request - Marmara Travel',
      html: htmlTemplate,
    });
    console.log(
      'Contact confirmation email sent to client successfully',
      response,
    );
    return response;
  } catch (error) {
    console.error('Error sending contact confirmation email', error);
    throw new Error(`Error sending contact confirmation email: ${error}`);
  }
};

export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: 'info@marmaraholidays.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log('Contact email sent successfully', response);
  } catch (error) {
    console.error(`Error sending contact email`, error);
    throw new Error(`Error sending contact email: ${error}`);
  }
};

// New flight booking email functions
export const sendFlightBookingConfirmationEmail = async (
  email: string,
  bookingData: {
    customerName: string;
    bookingReference: string;
    totalAmount: string;
    paymentStatus: string;
    departureCity: string;
    departureCode: string;
    arrivalCity: string;
    arrivalCode: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    flightNumber: string;
    airline: string;
    passengerDetails: string;
    bookingId: string;
    customerEmail: string;
  },
) => {
  const transporter = createNodemailerTransporter();

  try {
    let emailHtml = FLIGHT_BOOKING_CONFIRMATION_EMAIL_TEMPLATE;
    
    // Replace all placeholders
    Object.keys(bookingData).forEach(key => {
      const placeholder = `{${key}}`;
      emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), bookingData[key]);
    });

    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: `Flight Booking Confirmed - ${bookingData.bookingReference}`,
      html: emailHtml,
    });

    console.log('Flight booking confirmation email sent successfully', response);
  } catch (error) {
    console.error(`Error sending flight booking confirmation email`, error);
    throw new Error(`Error sending flight booking confirmation email: ${error}`);
  }
};

export const sendFlightBookingCancellationEmail = async (
  email: string,
  cancellationData: {
    customerName: string;
    bookingReference: string;
    cancellationDate: string;
    cancellationReason: string;
    refundStatus: string;
    refundAmount?: string;
    departureCity: string;
    departureCode: string;
    arrivalCity: string;
    arrivalCode: string;
    departureDate: string;
    departureTime: string;
    flightNumber: string;
    airline: string;
    customerEmail: string;
  },
) => {
  const transporter = createNodemailerTransporter();

  try {
    let emailHtml = FLIGHT_BOOKING_CANCELLATION_EMAIL_TEMPLATE;
    
    // Replace all placeholders
    Object.keys(cancellationData).forEach(key => {
      const placeholder = `{${key}}`;
      emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), cancellationData[key] || '');
    });

    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: email,
      subject: `Flight Booking Cancelled - ${cancellationData.bookingReference}`,
      html: emailHtml,
    });

    console.log('Flight booking cancellation email sent successfully', response);
  } catch (error) {
    console.error(`Error sending flight booking cancellation email`, error);
    throw new Error(`Error sending flight booking cancellation email: ${error}`);
  }
};

export const sendSalesNotificationEmail = async (
  clientDetails: string,
  phoneNumber: string,
  userName?: string,
) => {
  const transporter = createNodemailerTransporter();

  try {
    const response = await transporter.sendMail({
      from: `${senderInfo.name} <${senderInfo.email}>`,
      to: 'sales@marmaratravels.com',
      subject: `New Client Inquiry - ${userName || phoneNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Client Inquiry</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Client Information</h3>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
            <div style="margin-top: 20px;">
              <h4 style="color: #34495e;">Client Details:</h4>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #3498db; white-space: pre-wrap;">${clientDetails}</div>
            </div>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            This inquiry was automatically generated from WhatsApp conversation.
          </p>
        </div>
      `,
    });

    console.log('Sales notification email sent successfully', response);
  } catch (error) {
    console.error(`Error sending sales notification email`, error);
    throw new Error(`Error sending sales notification email: ${error}`);
  }
};
