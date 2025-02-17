import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express'; // Import Express Response type
import { ZodError, ZodIssue } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // Explicitly type the response

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.message,
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        // errors: exception.errors,
        errors: exception.errors.map((error: ZodIssue) => {
          return {
            validation: error.path.join('.'),
            message: error.message,
          };
        }),
      });
    } else {
      // Handle unexpected errors
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : 'Internal server error';
      response.status(500).json({
        errors: errorMessage,
      });
    }
  }
}
