import { CreateContactDto } from '@/contact/dto/create-contact.dto';
import {
  BOOKING_CONFIRMATION_EMAIL_TEMPLATE,
  feedback_Mail,
  NEW_BOOKING_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPATE,
} from './emailTemplates';
import { mailtrapClient, sender } from './mailtrap.config';

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
      email: 'ajmalmaker@icloud.com',
    },
  ];

  try {
    let emailContent = NEW_BOOKING_EMAIL_TEMPLATE;

    emailContent = emailContent.replace('{name}', bookingData.name);
    emailContent = emailContent.replace(
      '{packageName}',
      bookingData.packageName,
    );
    emailContent = emailContent.replace('{startDate}', bookingData.startDate);
    emailContent = emailContent.replace('{endDate}', bookingData.endDate);
    emailContent = emailContent.replace('{adults}', bookingData.adults);
    emailContent = emailContent.replace('{children}', bookingData.children);
    emailContent = emailContent.replace('{infants}', bookingData.infants);
    emailContent = emailContent.replace('{pets}', bookingData.pets);
    emailContent = emailContent.replace('{price}', bookingData.price);
    emailContent = emailContent.replace('{id}', bookingData.packageId);
    emailContent = emailContent.replace('{email}', bookingData.email);

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
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'New Contact Request',
      html: htmlTemplate,
      category: 'Contact',
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
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'We Received Your Request - Marmara Travel',
      html: htmlTemplate,
      category: 'Contact Confirmation',
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
