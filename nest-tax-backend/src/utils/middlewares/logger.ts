import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request
    const startAt = process.hrtime()
    const userAgent = request.get('user-agent') || ''

    const { send } = response
    response.send = (exitData) => {
      let responseData = {}
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      if (
        response
          ?.getHeader('content-type')
          ?.toString()
          .includes('application/json')
      ) {
        responseData = exitData.toString().slice(0, 1000)
      }
      const logger = new Logger(response.statusMessage)

      const responseDataString = JSON.stringify(responseData).replaceAll(
        String.raw`\"`,
        '"',
      )
      if (response.statusCode >= 500) {
        logger.error(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, request-body: ${JSON.stringify(
            body,
          )}, response-data: ${responseDataString}`,
        )
      } else if (response.statusCode >= 400) {
        logger.warn(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, request-body: ${JSON.stringify(
            body,
          )}, response-data: ${responseDataString}`,
        )
      } else {
        logger.log(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, request-body: ${JSON.stringify(
            body,
          )}, response-data: ${responseData}`,
        )
      }
      response.send = send
      return response.send(exitData)
    }

    next()
  }
}
