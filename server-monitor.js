#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const os = require('os');

class ServerMonitor {
  constructor() {
    this.serverProcess = null;
    this.restartCount = 0;
    this.maxRestarts = 10;
    this.restartDelay = 5000; // 5 seconds
    this.logFile = path.join(__dirname, 'logs', 'server-monitor.log');
    this.crashLogFile = path.join(__dirname, 'logs', 'crash-reports.log');
    this.isShuttingDown = false;
    this.lastCrashTime = null;
    this.crashThreshold = 3; // Max crashes in 5 minutes
    this.crashWindow = 5 * 60 * 1000; // 5 minutes
    this.recentCrashes = [];
    
    // Email configuration
    this.emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 465,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "info@marmaratravels.com",
        pass: process.env.SMTP_PASS || "Marmara1234."
      }
    };
    
    this.notificationEmails = (process.env.NOTIFICATION_EMAILS || '').split(',').filter(email => email.trim());
    
    this.setupLogging();
    this.setupSignalHandlers();
  }

  setupLogging() {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(`[${level}] ${message}`);
    
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  logCrash(error, exitCode, signal) {
    const timestamp = new Date().toISOString();
    const crashReport = {
      timestamp,
      error: error?.message || 'Unknown error',
      exitCode,
      signal,
      restartCount: this.restartCount,
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    const crashLogMessage = `[${timestamp}] [CRASH] ${JSON.stringify(crashReport, null, 2)}\n`;
    
    try {
      fs.appendFileSync(this.crashLogFile, crashLogMessage);
    } catch (error) {
      console.error('Failed to write crash log:', error.message);
    }
    
    return crashReport;
  }

  async sendEmailNotification(subject, message, crashReport = null) {
    if (!this.notificationEmails.length || !this.emailConfig.auth.user) {
      this.log('Email notifications not configured, skipping email', 'WARN');
      return;
    }

    try {
      const transporter = nodemailer.createTransporter(this.emailConfig);
      
      let htmlContent = `
        <h2>🚨 Marmara API Server Alert</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Server:</strong> ${os.hostname()}</p>
        <p><strong>Message:</strong> ${message}</p>
      `;
      
      if (crashReport) {
        htmlContent += `
          <h3>📊 Crash Details</h3>
          <ul>
            <li><strong>Exit Code:</strong> ${crashReport.exitCode}</li>
            <li><strong>Signal:</strong> ${crashReport.signal}</li>
            <li><strong>Restart Count:</strong> ${crashReport.restartCount}</li>
            <li><strong>Error:</strong> ${crashReport.error}</li>
          </ul>
          
          <h3>💻 System Information</h3>
          <ul>
            <li><strong>Platform:</strong> ${crashReport.systemInfo.platform}</li>
            <li><strong>Architecture:</strong> ${crashReport.systemInfo.arch}</li>
            <li><strong>Node Version:</strong> ${crashReport.systemInfo.nodeVersion}</li>
            <li><strong>Memory Usage:</strong> ${JSON.stringify(crashReport.systemInfo.memory)}</li>
            <li><strong>Uptime:</strong> ${crashReport.systemInfo.uptime} seconds</li>
          </ul>
        `;
      }
      
      const mailOptions = {
        from: this.emailConfig.auth.user,
        to: this.notificationEmails.join(','),
        subject: `[Marmara API] ${subject}`,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      this.log(`Email notification sent to: ${this.notificationEmails.join(', ')}`, 'INFO');
    } catch (error) {
      this.log(`Failed to send email notification: ${error.message}`, 'ERROR');
    }
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
      this.log(`Uncaught Exception in monitor: ${error.message}`, 'ERROR');
      this.log(error.stack, 'ERROR');
    });
    process.on('unhandledRejection', (reason, promise) => {
      this.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
    });
  }

  async gracefulShutdown(signal) {
    this.log(`Received ${signal}, initiating graceful shutdown...`, 'INFO');
    this.isShuttingDown = true;
    
    if (this.serverProcess) {
      this.log('Terminating server process...', 'INFO');
      this.serverProcess.kill('SIGTERM');
      
      // Force kill after 10 seconds if not terminated
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          this.log('Force killing server process...', 'WARN');
          this.serverProcess.kill('SIGKILL');
        }
      }, 10000);
    }
    
    await this.sendEmailNotification(
      'Server Monitor Shutdown',
      `Server monitor is shutting down due to ${signal} signal.`
    );
    
    setTimeout(() => {
      this.log('Monitor shutdown complete', 'INFO');
      process.exit(0);
    }, 2000);
  }

  checkCrashFrequency() {
    const now = Date.now();
    this.recentCrashes = this.recentCrashes.filter(crashTime => 
      now - crashTime < this.crashWindow
    );
    
    if (this.recentCrashes.length >= this.crashThreshold) {
      this.log(`Too many crashes (${this.recentCrashes.length}) in the last 5 minutes. Stopping restarts.`, 'ERROR');
      this.sendEmailNotification(
        'Critical: Too Many Server Crashes',
        `Server has crashed ${this.recentCrashes.length} times in the last 5 minutes. Automatic restarts have been disabled to prevent infinite crash loops.`
      );
      return false;
    }
    
    return true;
  }

  async startServer() {
    if (this.isShuttingDown) {
      return;
    }

    this.log('Starting Marmara API server...', 'INFO');
    
    const serverCommand = 'npm';
    const serverArgs = ['run', 'start:dev'];
    
    this.serverProcess = spawn(serverCommand, serverArgs, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`SERVER: ${output}`, 'INFO');
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        this.log(`SERVER ERROR: ${error}`, 'ERROR');
      }
    });

    this.serverProcess.on('close', async (code, signal) => {
      this.log(`Server process exited with code ${code} and signal ${signal}`, 'WARN');
      
      if (!this.isShuttingDown) {
        const crashReport = this.logCrash(new Error(`Process exited with code ${code}`), code, signal);
        this.recentCrashes.push(Date.now());
        
        if (this.checkCrashFrequency() && this.restartCount < this.maxRestarts) {
          this.restartCount++;
          this.log(`Attempting restart ${this.restartCount}/${this.maxRestarts} in ${this.restartDelay}ms...`, 'INFO');
          
          await this.sendEmailNotification(
            'Server Crashed - Restarting',
            `Server crashed and is being automatically restarted (attempt ${this.restartCount}/${this.maxRestarts}).`,
            crashReport
          );
          
          setTimeout(() => {
            this.startServer();
          }, this.restartDelay);
        } else {
          this.log('Max restart attempts reached or too many recent crashes. Server will not be restarted.', 'ERROR');
          await this.sendEmailNotification(
            'Critical: Server Down - Manual Intervention Required',
            `Server has crashed and cannot be automatically restarted. Manual intervention is required.`,
            crashReport
          );
        }
      }
    });

    this.serverProcess.on('error', async (error) => {
      this.log(`Failed to start server: ${error.message}`, 'ERROR');
      const crashReport = this.logCrash(error, null, null);
      
      await this.sendEmailNotification(
        'Server Start Failed',
        `Failed to start the server: ${error.message}`,
        crashReport
      );
    });

    // Reset restart count on successful startup (after 30 seconds)
    setTimeout(() => {
      if (this.serverProcess && !this.serverProcess.killed) {
        this.restartCount = 0;
        this.log('Server appears to be running stable, reset restart counter', 'INFO');
      }
    }, 30000);
  }

  async start() {
    this.log('🚀 Starting Marmara API Server Monitor', 'INFO');
    this.log(`Monitor PID: ${process.pid}`, 'INFO');
    this.log(`Max restarts: ${this.maxRestarts}`, 'INFO');
    this.log(`Restart delay: ${this.restartDelay}ms`, 'INFO');
    this.log(`Log file: ${this.logFile}`, 'INFO');
    this.log(`Crash log file: ${this.crashLogFile}`, 'INFO');
    
    if (this.notificationEmails.length > 0) {
      this.log(`Email notifications enabled for: ${this.notificationEmails.join(', ')}`, 'INFO');
      await this.sendEmailNotification(
        'Server Monitor Started',
        'Marmara API server monitor has been started and is now watching for crashes.'
      );
    } else {
      this.log('Email notifications disabled (no emails configured)', 'WARN');
    }
    
    await this.startServer();
  }
}

// Start the monitor
if (require.main === module) {
  const monitor = new ServerMonitor();
  monitor.start().catch(error => {
    console.error('Failed to start server monitor:', error);
    process.exit(1);
  });
}

module.exports = ServerMonitor;