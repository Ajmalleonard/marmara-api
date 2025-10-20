import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './Guards/AllExceptions.filter';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';

// Global process-level error handlers to prevent unexpected crashes
process.on('uncaughtException', (err) => {
  console.error('[Global] UncaughtException in process:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Global] UnhandledRejection in process:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:2020',
      'https://apidog.com',
      'chrome-extension://*',
      'https://marmaraholidays.com',
      'https://www.marmaraholidays.com',
      'https://www.marmaratravels.com',
      'https://admin.marmaraholidays.com',
    ],
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Cookie',
      'Set-Cookie',
    ],
    exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header to the client
  });

  // Debug middleware
  app.use((req, res, next) => {
    console.log('Cookies:', req.cookies);
    next();
  });
  // Global pipes and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Set global prefix (optional)
  // app.setGlobalPrefix('api');

  // Ensure the server is listening on all network interfaces
  await app.listen(2020, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
function ensureWhatsAppAuthPersistence() {
  const dir = path.join(process.cwd(), 'whatsapp-auth');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Check writability
    fs.accessSync(dir, fs.constants.W_OK);
    // Optional: log path for operational visibility
    console.log(`[Bootstrap] WhatsApp auth directory ready: ${dir}`);
  } catch (err) {
    console.error('[Bootstrap] WhatsApp auth directory is not writable or cannot be created:', err);
  }
}
ensureWhatsAppAuthPersistence();
bootstrap();
