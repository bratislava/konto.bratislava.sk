import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

import { errorTypeKeys } from '../guards/dtos/error.dto'
import { symbolKeysToStrings } from '../logging'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(`${ErrorFilter.name}non HTTP`)
      logger.error(exception)
      throw exception
    }

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { name, stack, message } = exception

    // TODO remove when this is resolved: https://github.com/bratislava/private-konto.bratislava.sk/issues/1069
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(ErrorFilter.name)
      logger.error(exception)
      return
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR)

    if (response.locals.middlewareUsed) {
      response.json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        [errorTypeKeys.errorType]: name,
        message,
        [errorTypeKeys.stack]: stack,
      })
    } else {
      const logger = new LineLoggerSubservice(ErrorFilter.name)

      logger.error(exception)
    }
  }
}

@Catch(TypeError)
export class TypeErrorFilter implements ExceptionFilter {
  catch(exception: TypeError, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(`${ErrorFilter.name} non HTTP`)
      logger.error(exception)
      throw exception
    }

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { name, stack, message } = exception

    // TODO remove when this is resolved: https://github.com/bratislava/private-konto.bratislava.sk/issues/1069
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(TypeErrorFilter.name)
      logger.error(exception)
      return
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR)

    if (response.locals.middlewareUsed) {
      response.json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        [errorTypeKeys.errorType]: name,
        message,
        [errorTypeKeys.stack]: stack,
      })
    } else {
      const logger = new LineLoggerSubservice(TypeErrorFilter.name)

      logger.error(exception)
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(`${ErrorFilter.name} non HTTP`)
      logger.error(exception)
      throw exception
    }

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    // TODO remove when this is resolved: https://github.com/bratislava/private-konto.bratislava.sk/issues/1069
    if (host.getType() !== 'http') {
      const logger = new LineLoggerSubservice(HttpExceptionFilter.name)
      logger.error(exception)
      return
    }

    const exceptionResponse = exception.getResponse()
    response.status(status)

    if (response.locals.middlewareUsed) {
      if (typeof exceptionResponse === 'object') {
        response.json({
          ...symbolKeysToStrings(exceptionResponse),
          [errorTypeKeys.errorType]: 'HttpException',
          [errorTypeKeys.stack]: exception.stack,
        })
      } else {
        response.json({
          response: exceptionResponse,
          [errorTypeKeys.errorType]: 'HttpException',
          [errorTypeKeys.stack]: exception.stack,
        })
      }
    } else {
      const logger = new LineLoggerSubservice(ErrorFilter.name)

      logger.error(exception)
    }
  }
}
