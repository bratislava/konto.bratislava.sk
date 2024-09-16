import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export default class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, originalUrl, body } = request
    let { ip } = request
    const startAt = process.hrtime()
    const userAgent = request.get('user-agent') || ''
    const { statusMessage, statusCode } = response

    const { send } = response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.send = (exitData: string | object | Buffer | Array<any>) => {
      let responseData = {}
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      if (
        response
          ?.getHeader('content-type')
          ?.toString()
          .includes('application/json')
      ) {
        responseData = exitData.toString()
      }
      const logger = new Logger(statusMessage)

      const responseStringified = JSON.stringify(responseData).replaceAll(
        String.raw`\"`,
        '"',
      )

      const bodyStringified = JSON.stringify({
        ...body,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(body?.eidToken ? { eidToken: '***' } : {}),
      })
      if (!ip) {
        ip = '<NO IP>'
      }

      if (statusCode >= 500) {
        logger.error(
          `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${bodyStringified}, response-data: ${responseStringified}`,
        )
      } else if (statusCode >= 400) {
        logger.warn(
          `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${bodyStringified}, response-data: ${responseStringified}`,
        )
      }
      // temporarily only log when problems happen
      // else {
      // logger.log(
      //   `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${bodyStringified}, response-data: ${responseStringified}`,
      // )
      // }
      response.send = send
      return response.send(exitData)
    }

    next()
  }
}
