import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { separateLogFromResponseObj } from '../logging'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request
    const startAt = process.hrtime()
    const userAgent = request.get('user-agent') || ''

    const send = response.send
    response.send = (exitData) => {
      let responseData = ''
      let logData = {}
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      if (response?.getHeader('content-type')?.toString().includes('application/json')) {
        // Filter out keys starting with `$`. We will log them later
        const { responseLog, responseMessage } = separateLogFromResponseObj(
          typeof exitData === 'string' ? JSON.parse(exitData) : exitData
        )
        exitData = JSON.stringify(responseMessage)

        responseData = exitData.toString().slice(0, 2000)
        logData = responseLog
      }
      const logger = new LineLoggerSubservice(response.statusMessage)

      let userId = ''
      try {
        if (request.headers.authorization) {
          const token = request.headers.authorization.split('.')[1]
          const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
          userId = tokenData.sub
        }
      } catch (error) {}

      const logObj: Record<string, string | number> = {
        method,
        originalUrl,
        statusCode: response.statusCode,
        responseTime,
        userAgent,
        ip,
        userId,
        'request-body': JSON.stringify(body),
        'response-data': responseData,
        ...logData,
      }
      if (response.statusCode >= 500 || logObj.alert) {
        logger.error(logObj)
      } else if (response.statusCode >= 400) {
        logger.warn(logObj)
      } else {
        logger.log(logObj)
      }
      response.send = send
      return response.send(exitData)
    }

    next()
  }
}
