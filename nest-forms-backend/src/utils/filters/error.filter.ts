import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

import { symbolKeysToStrings } from '../logging'

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { name, stack, message } = exception

    response.status(HttpStatus.INTERNAL_SERVER_ERROR)

    if (response.locals.middlewareUsed) {
      response.json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        '$Symbol-errorType': name,
        message,
        '$Symbol-stack': stack,
      })
    } else {
      const logger = new LineLoggerSubservice(ErrorFilter.name)

      logger.error(exception)
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    response.status(status)

    if (response.locals.middlewareUsed) {
      if (typeof exceptionResponse === 'object') {
        response.json({
          ...symbolKeysToStrings(exceptionResponse),
          '$Symbol-errorType': 'HttpException',
          '$Symbol-stack': exception.stack,
        })
      } else {
        response.json({
          response: exceptionResponse,
          '$Symbol-errorType': 'HttpException',
          '$Symbol-stack': exception.stack,
        })
      }
    } else {
      const logger = new LineLoggerSubservice(HttpExceptionFilter.name)

      logger.error(exception)
    }
  }
}
