import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { separateLogFromResponseObj } from '../logging'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

@Injectable()
export default class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, body, ip, userAgent, userId } =
      this.extractRequestData(request)
    const startAt = process.hrtime()
    const { statusMessage, statusCode } = response

    const { send } = response
    response.send = (exitData: string | object | Buffer | Array<any>) => {
      const { responseData, logData, returnExitData } = this.parseExitData(
        response,
        exitData,
      )

      const logger = new LineLoggerSubservice(statusMessage)

      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      const logObj: Record<string, string | number> = {
        method,
        originalUrl,
        statusCode,
        responseTime,
        userAgent,
        ip,
        userId,
        'request-body': JSON.stringify(body),
        'response-data': responseData,
        ...logData,
      }
      if (response.statusCode >= 500 || logObj.alert === 1) {
        logger.error(logObj)
      } else if (response.statusCode >= 400) {
        logger.warn(logObj)
      } else {
        logger.log(logObj)
      }
      response.send = send
      return response.send(returnExitData)
    }

    next()
  }

  private extractRequestData(request: Request): {
    method: string
    ip: string
    userAgent: string
    originalUrl: string
    body: any
    userId: string
  } {
    const { method, originalUrl, body } = request
    const ip = request.ip ?? '<NO IP>'
    const userAgent = request.get('user-agent') || ''

    // Extract userId from headers
    let userId = ''
    try {
      if (request.headers.authorization) {
        const token = request.headers.authorization.split('.')[1]
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = tokenData.sub
      }
    } catch (error) {
      /* empty */
    }

    return { method, originalUrl, body, ip, userAgent, userId }
  }

  private parseExitData(
    response: Response,
    exitData: string | object | Buffer | Array<any>,
  ): {
    returnExitData: typeof exitData
    responseData: string
    logData: Record<string, unknown>
  } {
    if (
      !response
        ?.getHeader('content-type')
        ?.toString()
        .includes('application/json')
    ) {
      return {
        responseData: <string>exitData,
        returnExitData: exitData,
        logData: {},
      }
    }
    // Filter out keys starting with `$`. We will log them later
    const { responseLog, responseMessage } = separateLogFromResponseObj(
      typeof exitData === 'string' ? JSON.parse(exitData) : exitData,
    )
    const returnExitData = JSON.stringify(responseMessage)

    const responseData = returnExitData.toString()
    return { returnExitData, responseData, logData: responseLog }
  }
}
