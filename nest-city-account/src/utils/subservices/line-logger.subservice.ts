import { Injectable, LoggerService } from '@nestjs/common'
import * as process from 'node:process'
import { escapeForLogfmt, isLogfmt, ToLogfmt } from '../logging'

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

@Injectable()
export class LineLoggerSubservice implements LoggerService {
  protected context?: string

  protected color: boolean

  constructor(context?: string, color = true) {
    this.context = context
    this.color = color
  }

  private printLog(
    severity: string,
    message: unknown,
    optionalParams: unknown[],
    colorCode: string
  ) {
    const completeArray = [message, ...optionalParams]

    let stringItems = ''
    const otherItems: unknown[] = []

    completeArray.forEach((item) => {
      if (typeof item === 'string') {
        stringItems += item + ' '
      } else {
        otherItems.push(item)
      }
      stringItems = stringItems.trim()
    })

    let logfmtStringItems = ''
    if (stringItems.length != 0) {
      if (isLogfmt(stringItems)) {
        logfmtStringItems = " ".concat(stringItems)
      }
      else {
        logfmtStringItems = ` message="${escapeForLogfmt(stringItems)}"`
      }
    }

    const logfmtOtherItems = otherItems.map((param) => ToLogfmt(param)).join(' ')

    let context = ''
    if (this.context) {
      context = ` context="${this.context}"`
    }

    console.log(
      `${this.color ? colorCode : ''}process="[Nest]" processPID="${
        process.pid
      }" datetime="${getCurrentDateTime()}" severity="${severity}"${context}${logfmtStringItems} ${logfmtOtherItems}${
        this.color ? '\x1b[0m' : ''
      }`
    )
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('LOG', message, optionalParams, '\x1b[32m')
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('FATAL', message, optionalParams, '\x1b[1m')
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('ERROR', message, optionalParams, '\x1b[31m')
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('WARN', message, optionalParams, '\x1b[33m')
  }

  debug?(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('DEBUG', message, optionalParams, '\x1b[35m')
  }

  verbose?(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('VERBOSE', message, optionalParams, '')
  }
}
