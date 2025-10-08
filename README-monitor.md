# Server Monitor Documentation

## Overview

The Server Monitor is a robust crash detection and automatic restart system for the Marmara API server. It provides:

- **Automatic crash detection** - Monitors the server process and detects crashes
- **Instant process termination** - Kills all related processes when a crash is detected
- **Automatic restart** - Restarts the server automatically after a crash
- **Comprehensive logging** - Logs all events, crashes, and restart attempts
- **Email notifications** - Sends email alerts when crashes occur
- **Crash frequency protection** - Prevents infinite restart loops

## Quick Start

### 1. Configure Email Notifications (Optional)

```bash
# Copy the environment template
cp .env.monitor .env.local

# Edit .env.local with your email settings
nano .env.local
```

### 2. Start the Server with Monitoring

```bash
# Using the startup script (recommended)
./start-with-monitor.sh

# Or directly with Node.js
node server-monitor.js
```

## Configuration

### Environment Variables (.env.local)

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com    # Your email address
SMTP_PASS=your-app-password       # Your email app password

# Notification Recipients
NOTIFICATION_EMAILS=admin@company.com,dev@company.com

# Monitor Settings (optional)
MAX_RESTARTS=10                   # Maximum restarts before giving up
RESTART_DELAY=5000               # Delay between restarts (ms)
CRASH_THRESHOLD=3                # Crashes within window to trigger protection
CRASH_WINDOW=300000              # Time window for crash counting (ms)
```

### Gmail Setup

For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an "App Password" for the monitor
3. Use the app password in `SMTP_PASS`

## Features

### 🔍 Crash Detection

- Monitors server process health
- Detects unexpected exits and crashes
- Identifies connection errors and timeouts

### 🔄 Automatic Recovery

- Terminates all related processes on crash
- Restarts the server automatically
- Implements exponential backoff for restart delays

### 📝 Comprehensive Logging

- **General logs**: `logs/server-monitor.log`
- **Crash reports**: `logs/crash-reports.log`
- Timestamped entries with detailed information

### 📧 Email Notifications

- Instant crash alerts via email
- Includes crash details and restart status
- Configurable recipient list

### 🛡️ Protection Mechanisms

- **Restart limits**: Prevents infinite restart loops
- **Crash frequency monitoring**: Detects rapid crash cycles
- **Graceful shutdown**: Handles termination signals properly

## Log Files

### Server Monitor Log (`logs/server-monitor.log`)

```
[2024-01-08 12:00:00] INFO: Server monitor started
[2024-01-08 12:00:01] INFO: Starting server...
[2024-01-08 12:00:05] INFO: Server started successfully (PID: 12345)
[2024-01-08 12:15:30] WARN: Server crashed with code 1
[2024-01-08 12:15:31] INFO: Restarting server (attempt 1/10)...
```

### Crash Reports Log (`logs/crash-reports.log`)

```
[2024-01-08 12:15:30] CRASH REPORT:
- Time: 2024-01-08T12:15:30.123Z
- Exit Code: 1
- Signal: null
- Restart Attempt: 1/10
- Uptime: 15 minutes 25 seconds
```

## Commands

### Start with Monitoring

```bash
./start-with-monitor.sh
```

### Stop the Monitor

Press `Ctrl+C` or send SIGTERM/SIGINT to the monitor process.

### View Logs

```bash
# Monitor logs
tail -f logs/server-monitor.log

# Crash reports
tail -f logs/crash-reports.log

# Both logs
tail -f logs/*.log
```

## Troubleshooting

### Email Not Working

1. Check SMTP settings in `.env.local`
2. Verify email credentials
3. Check firewall/network restrictions
4. Look for email errors in monitor logs

### Server Not Restarting

1. Check if `npm run start:dev` works manually
2. Verify Node.js and npm are installed
3. Check file permissions
4. Review crash reports for patterns

### High CPU Usage

1. Check for rapid crash/restart cycles
2. Review crash frequency settings
3. Investigate underlying server issues

## Security Notes

- Store email credentials securely in `.env.local`
- Don't commit `.env.local` to version control
- Use app passwords instead of main passwords
- Regularly rotate email credentials

## Integration with Process Managers

The monitor can work alongside process managers like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start monitor with PM2
pm2 start server-monitor.js --name "marmara-monitor"

# Monitor PM2 processes
pm2 monit
```

## Support

For issues or questions about the server monitor:

1. Check the log files first
2. Review this documentation
3. Test email configuration separately
4. Contact the development team
