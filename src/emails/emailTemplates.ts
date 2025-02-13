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
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
    style="color-scheme:light dark;supported-color-schemes:light dark;">

<head>
    <meta data-fr-http-equiv="Content-Type" content="text/html charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light dark">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if mso]>
      <style type="text/css">
        body, table, td, a, span, h1, h2, h3, h4, h5, p, a, img, ul, ol, li { font-family: Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; }
      </style>
    <![endif]-->
    <!--[if !mso]><!-->
    <!--<![endif]-->
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            word-wrap: normal;
            word-spacing: normal;
        }
    </style>
    <style type="text/css">
        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        /* DARK MODE STYLES */
        @media (prefers-color-scheme: dark) {
            .darkmode-bg1 {
                background-color: #17181A !important;
            }

            .darkmode-bg2 {
                background-color: #222325 !important;
            }

            .darkmode-text1 {
                color: #FEF7F9 !important;
            }

            .darkmode-text2 {
                color: #DCDDDF !important;
            }
        }
    </style>
</head>

<body bgcolor="#DCDCDF" width="100%"
    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;word-wrap: normal; word-spacing:normal; width: 100% !important; margin: 0px; padding: 0px;"
    class="darkmode-bg1 body" id="body">
    <div style="display: none; max-height: 0px; overflow: hidden;">
        Your booking details are confirmed. Thank you for choosing Marmara Holidays!
    </div>
    <table bgcolor="#DCDCDF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0"
        class="wrapper darkmode-bg1" aria-roledescription="email" aria-label="Marmara Holidays"
        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
        <tr>
            <td width="100%" align="center" class="darkmode-bg1"
                style="-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family: 'proxima_nova', Helvetica, Arial, sans-serif;padding-top: 40px;">
                <table bgcolor="#FFFFFF" align="center" border="0" cellpadding="0" cellspacing="0"
                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                    width="580" class="fluid darkmode-bg2" role="presentation">
                    <tr>
                        <td align="center"
                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                            <!-- HEADER : START -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid darkmode-bg2" role="presentation">
                                <tr>
                                    <td bgcolor="#FFFFFF"
                                        background="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-image: url('https://mktg.spaceship.com/marketing/common/header/white-bg_580x88px.png');width: 580px;"
                                        width="580" class="fluid darkmode-bg2">
                                        <div>
                                            <div style="font-size: 0;">
                                                <table width="580" align="center" border="0" cellpadding="0"
                                                    cellspacing="0"
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                                    class="fluid" role="presentation">
                                                    <tr>
                                                        <td align="center" valign="middle"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                            <table align="center" width="100%" border="0"
                                                                cellspacing="0" cellpadding="0" role="presentation"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 100%;">
                                                                <tr>
                                                                    <td valign="middle" align="left"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 28px 40px 28px 40px;"
                                                                        class="p-20-16">
                                                                        <a href="https://www.marmaraholidays.com/"
                                                                            target="_blank"
                                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                            title="Marmara Holidays">
                                                                            <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                                alt="Marmara Holidays" height="32"
                                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0;text-decoration: none; display: block; height: 32px;width: auto;"
                                                                                border="0"
                                                                                class="nav-logo darkmode-hide">
                                                                            <!--[if !mso]><! -->
                                                                            <img src="https://mktg.spaceship.com/master/header/spacemail-logo_dark_283x64px.png"
                                                                                alt="Marmara Holidays" height="32"
                                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0;text-decoration: none; display: none; height: 32px;width: auto;"
                                                                                border="0"
                                                                                class="nav-logo darkmode-show" /><!--<![endif]-->
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <!-- HEADER : END -->
                            <!-- EMAIL CONTENT : START -->
                            <table bgcolor="#FFFFFF" align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid darkmode-bg2" role="presentation">
                                <tr>
                                    <td align="center"
                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 0px 40px 0px;">
                                        <!-- CONTENT : START -->
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                            width="580" class="fluid" role="presentation">
                                            <tr>
                                                <td align="left"
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-align: left;padding: 24px 40px 0px 40px;"
                                                    class="px-16">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Dear {name},</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Thank you for booking with Marmara
                                                        Holidays! Your booking details are confirmed below:</p>
                                                    <h2 style="color: #1D1D20; font-size: 20px; font-weight: bold; font-family: 'proxima_nova', Arial, Tahoma; letter-spacing: 0; line-height: 26px; margin:0px 0px 12px 0px;"
                                                        class="darkmode-text1">Booking Details</h2>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Package Name:</strong>
                                                        {packageName}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Start Date:</strong>
                                                        {startDate}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>End Date:</strong>
                                                        {endDate}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Adults:</strong>
                                                        {adults}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Children:</strong>
                                                        {children}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Infants:</strong>
                                                        {infants}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Pets:</strong>
                                                        {pets}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Total Price:</strong>
                                                        {price}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">If you have any questions or need
                                                        assistance, feel free to contact us.</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- CONTENT : END -->
                                    </td>
                                </tr>
                            </table>
                            <!-- EMAIL CONTENT : END -->
                <!-- NEED HELP : START -->
                <table align="center" border="0" cellpadding="0" cellspacing="0"
                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                    width="580" class="fluid" role="presentation">
                    <tr>
                        <td align="center"
                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 40px 40px 40px 40px; "
                            class="px-16 darkmode-bg6"> <!-- Light mode: pale gray background (#F2F2F2) -->
                            <!-- Dark mode: dark gray background (#2F3032) via darkmode-bg6 class -->
                            <h2 style="color: #1D1D20; font-size: 20px; font-weight: bold; font-family: 'proxima_nova', Arial, Tahoma; letter-spacing: 0; line-height: 26px; margin:0px 0px 10px 0px;"
                                class="darkmode-text1"> <!-- Light mode: dark text (#1D1D20) -->
                                <!-- Dark mode: light text (#FEF7F9) via darkmode-text1 class -->
                                Need Help?
                            </h2>
                            <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #575758; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                class="darkmode-text2"> <!-- Light mode: gray text (#575758) -->
                                <!-- Dark mode: light gray text (#DCDDDF) via darkmode-text2 class -->
                                Check out answers to the most common questions in our Help
                                Center. If you can't find the answer, you can reach out, 24/7.
                            </p>
                            <!--button start-->
                            <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;margin:0px 0px 0px 0px;">
                                <a href="https://www.marmaraholidays.com/help-center/" target="_blank"
                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background: #394EFF; background-color:#394EFF; text-decoration: none; padding: 12px 20px; color: #ffffff; border-radius: 24px; display:inline-block; mso-padding-alt:0;text-underline-color:#394EFF; font-weight: 700;font-size: 16px;line-height: 16px;mso-line-height-rule:exactly;text-align: center;"
                                    class="darkmode-text1 darkmode-bg3">
                                    <!-- Light mode: blue button (#394EFF) with white text (#ffffff) -->
                                    <!-- Dark mode: purple button (#7A4FE2) via darkmode-bg3 class and white text (#ffffff) -->
                                    <!--[if mso]><i style="letter-spacing: 16px;mso-font-width:-100%;mso-text-raise:16pt" hidden>&nbsp;</i><![endif]-->
                                    <span
                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;mso-text-raise:8pt;vertical-align: bottom;">Visit
                                        Help
                                        Center</span><!--[if mso]><i style="letter-spacing: 16px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]-->
                                </a>
                            </p>
                            <!--button end-->
                        </td>
                    </tr>
                </table>
                <!-- NEED HELP : END -->
                            <!-- FOOTER : START -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid" role="presentation">
                                <tr>
                                    <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 32px 40px 0px 40px;"
                                        class="px-16">
                                        <table align="center" width="100%" border="0" cellspacing="0" cellpadding="0"
                                            role="presentation"
                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                            <tr>
                                                <td align="left"
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:8px 0px 0px 0px;"
                                                    class="no-padding">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin: 0px 0px 0px 0px; font-weight: 700;"
                                                        class="darkmode-text1">Follow us</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 16px 0px 0px 0px;">
                                                    <table align="left" border="0" cellspacing="0" cellpadding="0"
                                                        role="presentation"
                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                        <tr>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 16px 0px 0px;">
                                                                <a href="https://www.facebook.com/marmaraholidays"
                                                                    target="_blank"
                                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                    title="Marmara Holidays Facebook page"><img
                                                                        src="https://mktg.spaceship.com/marketing/common/footer/facebook_dark_64x64px.png"
                                                                        alt="Facebook" width="32"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: block; width: 32px;"
                                                                        border="0"></a>
                                                            </td>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 16px 0px 0px;">
                                                                <a href="https://twitter.com/marmaraholidays"
                                                                    target="_blank"
                                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                    title="Marmara Holidays X page"><img
                                                                        src="https://mktg.spaceship.com/marketing/common/footer/x_dark_64x64px.png"
                                                                        alt="X" width="32"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: block; width: 32px;"
                                                                        border="0"></a>
                                                            </td>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 16px 0px 0px;">
                                                                <a href="https://www.instagram.com/marmaraholidays/"
                                                                    target="_blank"
                                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                    title="Marmara Holidays Instagram page"><img
                                                                        src="https://mktg.spaceship.com/marketing/common/footer/instagram_dark_64x64px.png"
                                                                        alt="Instagram" width="32"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: block; width: 32px;"
                                                                        border="0"></a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 40px 0px 40px;"
                                        class="px-16">
                                        <table align="left" width="100%" border="0" cellspacing="0" cellpadding="0"
                                            role="presentation"
                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                            <tr>
                                                <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 32px 0px 32px 0px;border-bottom: 1px solid #2B2B2D;"
                                                    class="py-24 darkmode-border1">
                                                    <table align="left" border="0" cellspacing="0" cellpadding="0"
                                                        role="presentation"
                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                        <tr>
                                                            <th align="center" style="padding: 8px 8px 8px 0px;"
                                                                class="cell-responsive a-lt px-0">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                                    class="darkmode-text1"><a
                                                                        href="https://marmaraholidays.com/v1.0
                                                                        target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                                        class="darkmode-text1"
                                                                        title="About us">Terms</a></p>
                                                            </th>
                                                            <th align="center" style="padding: 8px 8px 8px 8px;"
                                                                class="cell-responsive a-lt px-0">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                                    class="darkmode-text1"><a
                                                                        href="https://www.marmaraholidays.com/blog/"
                                                                        target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                                        class="darkmode-text1" title="Blog">Blog</a></p>
                                                            </th>
                                                            <th align="center" style="padding: 8px 8px 8px 8px;"
                                                                class="cell-responsive a-lt px-0">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                                    class="darkmode-text1"><a
                                                                        href="https://marmaraholidays.com/about
                                                                        target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                                        class="darkmode-text1"
                                                                        title="Contact">About</a></p>
                                                            </th>
                                                            <th align="center" style="padding: 8px 8px 8px 8px;"
                                                                class="cell-responsive a-lt px-0">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                                    class="darkmode-text1"><a
                                                                        href="https://marmaraholidays.com/v1.0/privacy"
                                                                        target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                                        class="darkmode-text1" title="Legal">Privacy</a>
                                                                </p>
                                                            </th>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 40px 0px 40px 0px;"
                                                    class="py-32">
                                                    <table width="100%" align="center" border="0" cellspacing="0"
                                                        cellpadding="0"
                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 100%;"
                                                        role="presentation">
                                                        <tr>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0px 0px 16px 0px;">
                                                                <a href="https://www.marmaraholidays.com/"
                                                                    target="_blank"
                                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                    title="Marmara Holidays">
                                                                    <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                        alt="Marmara Holidays" width="94"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: block; width: 94px;"
                                                                        border="0" class="darkmode-hide">
                                                                    <!--[if !mso]><! -->
                                                                    <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                        alt="Marmara Holidays" width="94"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: none; width: 94px;"
                                                                        border="0"
                                                                        class="darkmode-show" /><!--<![endif]-->
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #6F6E6F; font-size: 12px; line-height: 16px; margin: 0px; font-weight: 400;letter-spacing: 0.2px;"
                                                                    class="darkmode-text4"><a href="#" target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #6F6E6F;"
                                                                        class="darkmode-text4"
                                                                        title="Marmara Holidays address">4600
                                                                        East Africa Tanzania Dar es salaam, Kariakoo 300, Mahiwa st, AZ
                                                                        85034,
                                                                        TZ <br>
                                                                        Marmara Holidays is a sub trademark and/or
                                                                        registered trademark of
                                                                        Marmara travel services, Inc.</a></p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <!-- FOOTER : END -->
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
`;
export const NEW_BOOKING_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
    style="color-scheme:light dark;supported-color-schemes:light dark;">

<head>
    <meta data-fr-http-equiv="Content-Type" content="text/html charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light dark">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if mso]>
      <style type="text/css">
        body, table, td, a, span, h1, h2, h3, h4, h5, p, a, img, ul, ol, li { font-family: Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; }
      </style>
    <![endif]-->
    <!--[if !mso]><!-->
    <!--<![endif]-->
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            word-wrap: normal;
            word-spacing: normal;
        }
    </style>
    <style type="text/css">
        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-regular-webfont.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-medium-webfont.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        @font-face {
            font-family: 'proxima_nova';
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.otf');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.woff') format('woff');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.woff2') format('woff2');
            src: url('https://mktg.spaceship.com/fonts/proximanova-bold-webfont.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
            mso-font-alt: 'Helvetica';
        }

        /* DARK MODE STYLES */
        @media (prefers-color-scheme: dark) {
            .darkmode-bg1 {
                background-color: #17181A !important;
            }

            .darkmode-bg2 {
                background-color: #222325 !important;
            }

            .darkmode-text1 {
                color: #FEF7F9 !important;
            }

            .darkmode-text2 {
                color: #DCDDDF !important;
            }
        }
    </style>
</head>

<body bgcolor="#DCDCDF" width="100%"
    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;word-wrap: normal; word-spacing:normal; width: 100% !important; margin: 0px; padding: 0px;"
    class="darkmode-bg1 body" id="body">
    <div style="display: none; max-height: 0px; overflow: hidden;">
        New package booking from {name}. Thank you for using Marmara Holidays!
    </div>
    <table bgcolor="#DCDCDF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0"
        class="wrapper darkmode-bg1" aria-roledescription="email" aria-label="Marmara Holidays"
        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
        <tr>
            <td width="100%" align="center" class="darkmode-bg1"
                style="-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family: 'proxima_nova', Helvetica, Arial, sans-serif;padding-top: 40px;">
                <table bgcolor="#FFFFFF" align="center" border="0" cellpadding="0" cellspacing="0"
                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                    width="580" class="fluid darkmode-bg2" role="presentation">
                    <tr>
                        <td align="center"
                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                            <!-- HEADER : START -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid darkmode-bg2" role="presentation">
                                <tr>
                                    <td bgcolor="#FFFFFF"
                                        background="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-image: url('https://mktg.spaceship.com/marketing/common/header/white-bg_580x88px.png');width: 580px;"
                                        width="580" class="fluid darkmode-bg2">
                                        <div>
                                            <div style="font-size: 0;">
                                                <table width="580" align="center" border="0" cellpadding="0"
                                                    cellspacing="0"
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                                    class="fluid" role="presentation">
                                                    <tr>
                                                        <td align="center" valign="middle"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                            <table align="center" width="100%" border="0"
                                                                cellspacing="0" cellpadding="0" role="presentation"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 100%;">
                                                                <tr>
                                                                    <td valign="middle" align="left"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 28px 40px 28px 40px;"
                                                                        class="p-20-16">
                                                                        <a href="https://www.marmaraholidays.com/"
                                                                            target="_blank"
                                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                            title="Marmara Holidays">
                                                                            <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                                alt="Marmara Holidays" height="32"
                                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0;text-decoration: none; display: block; height: 32px;width: auto;"
                                                                                border="0"
                                                                                class="nav-logo darkmode-hide">
                                                                            <!--[if !mso]><! -->
                                                                            <img src="https://mktg.spaceship.com/master/header/spacemail-logo_dark_283x64px.png"
                                                                                alt="Marmara Holidays" height="32"
                                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0;text-decoration: none; display: none; height: 32px;width: auto;"
                                                                                border="0"
                                                                                class="nav-logo darkmode-show" /><!--<![endif]-->
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <!-- HEADER : END -->
                            <!-- EMAIL CONTENT : START -->
                            <table bgcolor="#FFFFFF" align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid darkmode-bg2" role="presentation">
                                <tr>
                                    <td align="center"
                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 0px 0px 40px 0px;">
                                        <!-- CONTENT : START -->
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                            width="580" class="fluid" role="presentation">
                                            <tr>
                                                <td align="left"
                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-align: left;padding: 24px 40px 0px 40px;"
                                                    class="px-16">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Hello Admin,</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">New package booking from <strong>{name}</strong> with details are as follows:</p>
                                                    <h2 style="color: #1D1D20; font-size: 20px; font-weight: bold; font-family: 'proxima_nova', Arial, Tahoma; letter-spacing: 0; line-height: 26px; margin:0px 0px 12px 0px;"
                                                        class="darkmode-text1">Booking Details</h2>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Booking ID:</strong> {id}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Package Name:</strong> {packageName}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Check-in Date:</strong> {startDate}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Check-out Date:</strong> {endDate}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Number of Adults:</strong> {adults}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Number of Children:</strong> {children}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Number of Infants:</strong> {infants}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Pets:</strong> {pets}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1"><strong>Adults Price:</strong> {price}</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Contact client with email: <a href="mailto:{email}" style="color: #394EFF;">{email}</a> for reservation processing.</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Hope you enjoy the system.</p>
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 16px; line-height: 24px; margin:0px 0px 24px 0px;font-weight: 400;"
                                                        class="darkmode-text1">Best regards,<br>Ajmaljs System</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- CONTENT : END -->
                                    </td>
                                </tr>
                            </table>
                            <!-- EMAIL CONTENT : END -->
                            <!-- FOOTER : START -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0"
                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 580px;"
                                width="580" class="fluid" role="presentation">
                                <tr>
                                    <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 32px 40px 32px 40px;border-bottom: 1px solid #2B2B2D;"
                                        class="py-24 darkmode-border1">
                                        <table align="left" border="0" cellspacing="0" cellpadding="0"
                                            role="presentation"
                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                            <tr>
                                                <th align="center" style="padding: 8px 8px 8px 0px;"
                                                    class="cell-responsive a-lt px-0">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                        class="darkmode-text1"><a
                                                            href="https://marmaraholidays.com/v1.0
                                                            target="_blank"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                            class="darkmode-text1"
                                                            title="About us">Terms</a></p>
                                                </th>
                                                <th align="center" style="padding: 8px 8px 8px 8px;"
                                                    class="cell-responsive a-lt px-0">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                        class="darkmode-text1"><a
                                                            href="https://www.marmaraholidays.com/blog/"
                                                            target="_blank"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                            class="darkmode-text1" title="Blog">Blog</a></p>
                                                </th>
                                                <th align="center" style="padding: 8px 8px 8px 8px;"
                                                    class="cell-responsive a-lt px-0">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                        class="darkmode-text1"><a
                                                            href="https://marmaraholidays.com/about
                                                            target="_blank"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                            class="darkmode-text1"
                                                            title="Contact">About</a></p>
                                                </th>
                                                <th align="center" style="padding: 8px 8px 8px 8px;"
                                                    class="cell-responsive a-lt px-0">
                                                    <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #2B2B2D; font-size: 14px; line-height: 14px; margin: 0; font-weight: 400;"
                                                        class="darkmode-text1"><a
                                                            href="https://marmaraholidays.com/v1.0/privacy"
                                                            target="_blank"
                                                            style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: underline; color: #2B2B2D;"
                                                            class="darkmode-text1" title="Legal">Privacy</a>
                                                    </p>
                                                </th>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                 <tr>
                                                <td style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding: 40px 0px 40px 0px;"
                                                    class="py-32">
                                                    <table width="100%" align="center" border="0" cellspacing="0"
                                                        cellpadding="0"
                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;width: 100%;"
                                                        role="presentation">
                                                        <tr>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0px 0px 16px 0px;">
                                                                <a href="https://www.marmaraholidays.com/"
                                                                    target="_blank"
                                                                    style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #394eff;"
                                                                    title="Marmara Holidays">
                                                                    <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                        alt="Marmara Holidays" width="32"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: block; width: 94px;"
                                                                        border="0" class="darkmode-hide">
                                                                    <!--[if !mso]><! -->
                                                                    <img src="https://s3.eu-north-1.amazonaws.com/cnd.marmara.media/images/marmaracolor.png"
                                                                        alt="Marmara Holidays" width="32"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;line-height:100%;outline:none;-ms-interpolation-mode:bicubic;color:#394EFF !important;border: 0; text-decoration: none; display: none; width: 94px;"
                                                                        border="0"
                                                                        class="darkmode-show" /><!--<![endif]-->
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left"
                                                                style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
                                                                <p style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;color: #6F6E6F; font-size: 12px; line-height: 16px; margin: 0px; font-weight: 400;letter-spacing: 0.2px;"
                                                                    class="darkmode-text4"><a href="#" target="_blank"
                                                                        style="font-family:'proxima_nova', Helvetica, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;text-decoration: none; color: #6F6E6F;"
                                                                        class="darkmode-text4"
                                                                        title="Marmara Holidays address">4600
                                                                        East Africa Tanzania Dar es salaam, Kariakoo 300, Mahiwa st, AZ
                                                                        85034,
                                                                        TZ <br>
                                                                        Marmara Holidays is a sub trademark and/or
                                                                        registered trademark of
                                                                        Marmara travel services, Inc.</a></p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                            </table>
                            <!-- FOOTER : END -->
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
`;
