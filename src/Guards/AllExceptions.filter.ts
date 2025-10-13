import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Check if this is a GraphQL context
    if (host.getType<any>() === 'graphql') {
      // For GraphQL, we should let the exception bubble up
      // GraphQL will handle the error formatting
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Check if the message is an object and handle validation errors
    if (status === HttpStatus.BAD_REQUEST && typeof message === 'object') {
      message = {
        error: 'Bad Request',
        statusCode: status,
        messages: (message as any).message || ['Validation failed'],
      };
    } else if (typeof message === 'object') {
      message = (message as any).message || 'An error occurred';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
