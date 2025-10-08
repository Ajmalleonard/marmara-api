# WhatsApp Service Setup Guide

## QR Code Authentication

### How Often Do You Need to Scan?

**One-time setup per deployment environment:**
- The QR code scan is **NOT required every time** the server restarts
- WhatsApp authentication is saved in the `whatsapp-auth/` directory
- Once authenticated, the session persists across server restarts
- You only need to re-scan if:
  - The auth session expires (typically after weeks/months of inactivity)
  - You delete the `whatsapp-auth/` directory
  - WhatsApp logs out your session for security reasons

### Who Scans the QR Code?

**The application owner/admin** needs to scan the QR code with their personal WhatsApp account:

1. Start the server with `bun dev`
2. Look for the QR code in the terminal
3. Open WhatsApp on your phone
4. Go to Settings → Linked Devices → Link a Device
5. Scan the QR code displayed in the terminal

### Production Deployment

For production deployments:
- Scan the QR code once after initial deployment
- The authentication will persist in the `whatsapp-auth/` directory
- Make sure to backup this directory or include it in your deployment process
- Consider using a dedicated business WhatsApp number for professional use

## Spam Prevention

The system includes multiple layers of spam protection:

### 1. Cooldown Period
- Each customer phone number has a **5-minute cooldown** between notifications
- Prevents rapid-fire submissions from the same number
- Automatic cleanup of old entries

### 2. Admin Number Configuration
- Admin numbers are configured via `ADMIN_WHATSAPP_NUMBERS` environment variable
- Only configured admins receive notifications
- No public exposure of admin numbers

### 3. Controlled Access
- Notifications only sent through your API endpoints
- No direct WhatsApp number exposure to end users
- All messages go through your controlled backend

## Environment Configuration

```env
# Comma-separated list of admin phone numbers (with country code, no + sign)
ADMIN_WHATSAPP_NUMBERS="255710097350,1234567890"
```

## Security Best Practices

1. **Use a dedicated business number** for WhatsApp notifications
2. **Keep admin numbers private** - only in environment variables
3. **Monitor logs** for any suspicious activity
4. **Regular session cleanup** - the system automatically cleans old notification records
5. **Backup auth directory** for production deployments

## Troubleshooting

- If WhatsApp disconnects, check the logs for QR code generation
- Session files are stored in `whatsapp-auth/` directory
- Delete this directory to force re-authentication if needed