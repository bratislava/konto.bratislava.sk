import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { separateLogFromResponseObj } from '../logging'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

@Injectable()
export default class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const requestData = this.extractRequestData(request)
    const { method, originalUrl, body, ip, userAgent, userId } = requestData
    const startAt = process.hrtime()
    response.locals.middlewareUsed = 'true'

    const { send } = response
    response.send = (exitData: string | object | Buffer | unknown[]) => {
      response.locals.middlewareUsed = undefined

      const { responseData, logData, returnExitData } = this.parseExitData(
        response,
        exitData,
      )

      const logger = new LineLoggerSubservice(response.statusMessage)

      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
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
    body: unknown
    userId: string
  } {
    const method = request.method
    const originalUrl = request.originalUrl
    const body = request.body as unknown
    const ip = request.ip ?? '<NO IP>'
    const userAgent = (request.get('user-agent') as string) || ''

    // Extract userId from headers
    let userId = ''
    try {
      if (request.headers.authorization) {
        const parts = request.headers.authorization.split('.')
        const token = parts[1]
        if (token) {
          const tokenData = JSON.parse(
            Buffer.from(token, 'base64').toString(),
          ) as { sub?: string }
          userId = tokenData.sub ?? ''
        }
      }
    } catch {
      /* empty */
    }

    return { method, originalUrl, body, ip, userAgent, userId }
  }

  private parseExitData(
    response: Response,
    exitData: string | object | Buffer | unknown[],
  ): {
    returnExitData: typeof exitData
    responseData: string
    logData: Record<string, unknown>
  } {
    if (
      !response
        .getHeader('content-type')
        ?.toString()
        .includes('application/json')
    ) {
      return {
        responseData: <string>exitData,
        returnExitData: exitData,
        logData: {},
      }
    }

    let data: unknown = exitData

    // Parse string-type exitData if it is JSON
    if (typeof exitData === 'string') {
      try {
        data = JSON.parse(exitData)
      } catch {
        // If parsing fails, assume it's a plain string
        return {
          responseData: exitData,
          returnExitData: exitData,
          logData: {},
        }
      }
    }

    // Special handling for arrays
    if (Array.isArray(data)) {
      return {
        responseData: JSON.stringify(data),
        returnExitData: JSON.stringify(data),
        logData: {},
      }
    }

    // Filter out keys starting with `$`. We will log them later
    const { responseLog, responseMessage } = separateLogFromResponseObj(
      typeof exitData === 'string' ? JSON.parse(exitData) : exitData,
    )
    const returnExitData = JSON.stringify(responseMessage)

    return {
      returnExitData: responseMessage,
      responseData: returnExitData,
      logData: responseLog,
    }
  }
}
