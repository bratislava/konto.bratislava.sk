import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request
    const startAt = process.hrtime()
    const userAgent = request.get('user-agent') || ''

    const send = response.send
    response.send = (exitData) => {
      let responseData = {}
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      if (response?.getHeader('content-type')?.toString().includes('application/json')) {
        responseData = exitData.toString().slice(0, 1000)
      }
      const logger = new Logger(response.statusMessage)

      let userId = ''
      try {
        if (request.headers.authorization) {
          const token = request.headers.authorization.split('.')[1]
          const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
          userId = tokenData.sub
        }
      } catch (error) {}

      if (response.statusCode >= 500) {
        logger.error(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, userId: ${userId}, request-body: ${JSON.stringify(
            body
          )}, response-data: ${JSON.stringify(responseData).replaceAll('\\"', '"')}`
        )
      } else if (response.statusCode >= 400) {
        logger.warn(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, userId: ${userId}, request-body: ${JSON.stringify(
            body
          )}, response-data: ${JSON.stringify(responseData).replaceAll('\\"', '"')}`
        )
      } else {
        logger.log(
          `${method} ${originalUrl} Status-${
            response.statusCode
          } ${responseTime}ms - ${userAgent} ${ip}, userId: ${userId}, request-body: ${JSON.stringify(
            body
          )}, response-data: ${responseData}`
        )
      }
      response.send = send
      return response.send(exitData)
    }

    next()
  }
}
