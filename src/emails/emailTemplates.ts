export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
   <meta name="color-scheme" content="light">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
    
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6366F1;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>marmaraholidays team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const feedback_Mail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
    <title>I Need support</title>
</head>

<body
    style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Feedback</h1>
    </div>
    <div
        style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>message from , {email} </p>
       
        <div
            style="text-align: start; margin: 30px 0; background-color: white ; padding:20px ; border-radius: 20px; min-height: 200px">
            <span>{message}</span>
        </div>

        <p>Best regards,<br>{usermail}</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message, please do not reply to this email.</p>
    </div>
</body>

</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #6366F1; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>marmaraholidys team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const PASSWORD_UPDATE_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {UserName},</p>
    <p>We're writing to confirm that your password has been successfully updated.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #6366F1; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password changes, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>marmaraholidys team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #6366F1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>marmaraholidys team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPATE = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
    <title>Welcome to Marmara Holidays</title>
</head>

<body
    style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0;">
    <div
        style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366F1, #4338CA); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Welcome to
                Marmara Holidays!</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px;">
            <p style="font-size: 16px;">Hello {userName},</p>
            <p style="font-size: 16px;">We're thrilled to welcome you to Marmara Holidays! Your account has been
                successfully created, and we're excited to help you plan your next adventure.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.marmaraholidays.com"
                    style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px; transition: background-color 0.3s;">Explore
                    Our Services</a>
            </div>
            <p style="font-size: 16px;">Discover our range of services to make your holiday unforgettable:</p>
            <ul style="font-size: 16px; padding-left: 20px;">
                <li style="margin-bottom: 10px;">✈️ Flight Tickets: Find the best deals on airfare</li>
                <li style="margin-bottom: 10px;">🦁 Safari Booking: Experience thrilling wildlife adventures</li>
                <li style="margin-bottom: 10px;">🛂 Visa Arrangement: Hassle-free travel documentation</li>
                <li style="margin-bottom: 10px;">🚙 Game Driving Packages: Get up close with nature</li>
            </ul>
            <p style="font-size: 16px;">Our team is here to assist you every step of the way. If you have any questions
                or need help planning your trip, don't hesitate to contact us.</p>
            <p style="font-size: 16px;">We can't wait to help you create unforgettable memories!</p>
            <p style="font-size: 16px;">Best regards,<br>The Marmara Holidays Team</p>
        </div>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
        <p>This email was sent to {userEmail}. If you didn't create an account with us, please disregard this message.
        </p>
        <p>© 2024 Marmara Holidays. All rights reserved.</p>
    </div>
</body>

</html>`;

export const BOOKING_CONFIRMATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Booking Confirmation</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>Thank you for your booking with Marmara Holidays! Your booking details are as follows:</p>
    <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
      <p><strong>Booking ID:</strong> {id}</p>
      <p><strong>Package Name:</strong> {packageName}</p>
      <p><strong>Check-in Date:</strong> {startDate}</p>
      <p><strong>Check-out Date:</strong> {endDate}</p>
      <p><strong>Number of Adults:</strong> {adults}</p>
      <p><strong>Number of Children:</strong> {children}</p>
      <p><strong>Number of Infants:</strong> {Infants}</p>
      <p><strong>Pets:</strong> {pets}</p>
      <p><strong>Adults Price:</strong> {price}</p>
    </div>
    <p>You can view your booking details and download your ticket by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.marmaraholidays.com/booking/{id}" style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking</a>
    </div>
    <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
    <p>We hope you enjoy your stay!</p>
    <p>Best regards,<br>Marmara Holidays Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const NEW_BOOKING_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="forced-color-adjust" content="none">
    <title>Booking Confirmation</title>
</head>

<body
    style="font-family: Arial, sans-serif; color-scheme: light line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #6366F1, #6366F1); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Package Booking </h1>
    </div>
    <div
        style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello Admin,</p>
        <p>New package booking from <strong>{name}</strong> with details are as follows:</p>
        <div
            style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> {id}</p>
            <p><strong>Package Name:</strong> {packageName}</p>
            <p><strong>Check-in Date:</strong> {startDate}</p>
            <p><strong>Check-out Date:</strong> {endDate}</p>
            <p><strong>Number of Adults:</strong> {adults}</p>
            <p><strong>Number of Children:</strong> {children}</p>
            <p><strong>Number of Infants:</strong> {Infants}</p>
            <p><strong>Pets:</strong> {pets}</p>
            <p><strong>Adults Price:</strong> {price}</p>
        </div>
        <p>You can view your booking details and download your ticket by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.marmaraholidays.com/packages/{id}"
                style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View
                Package</a>
        </div>
        <p>Contact client with email: {email} for reservation processing .</p>
        <p>Hope you enjoy the system ❤️</p>
        <p>Best regards,<br>Ajmaljs System</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>

</html>
`;

