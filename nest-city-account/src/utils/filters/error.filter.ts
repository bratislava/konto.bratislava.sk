import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { RequiredError } from '../../generated-clients/new-magproxy/base'
import { symbolKeysToStrings } from '../logging'

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { name, stack, message } = exception
    const field = exception instanceof RequiredError ? exception.field : undefined

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      '$Symbol-errorType': name,
      message,
      '$Symbol-field': field,
      '$Symbol-stack': stack,
    })
  }
}

@Catch(TypeError)
export class TypeErrorFilter implements ExceptionFilter {
  catch(exception: TypeError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { name, stack, message } = exception

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      '$Symbol-errorType': name,
      message,
      '$Symbol-stack': stack,
    })
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    const exceptionResponse = exception.getResponse()
    response.status(status)
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
  }
}
