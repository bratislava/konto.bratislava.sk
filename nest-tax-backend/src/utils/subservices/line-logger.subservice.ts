import * as process from 'node:process'

import { LoggerService } from '@nestjs/common'

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
    colorCode: string,
  ) {
    const completeArray = [message, ...optionalParams]

    let stringItems = ''
    const otherItems: unknown[] = []

    completeArray.forEach((item) => {
      if (typeof item === 'string') {
        stringItems += `${item} `
      } else {
        otherItems.push(item)
      }
      stringItems = stringItems.trim()
    })

    let logfmtStringItems = ''
    if (stringItems.length > 0) {
      logfmtStringItems = isLogfmt(stringItems)
        ? ' '.concat(stringItems)
        : ` message="${escapeForLogfmt(stringItems)}"`
    }

    const logfmtOtherItems = otherItems
      .map((param) => ToLogfmt(param))
      .join(' ')

    let context = ''
    if (this.context) {
      context = ` context="${this.context}"`
    }

    // eslint-disable-next-line no-console
    console.log(
      `${this.color ? colorCode : ''}process="[Nest]" processPID="${
        process.pid
      }" datetime="${getCurrentDateTime()}" severity="${severity}"${context}${logfmtStringItems} ${logfmtOtherItems}${
        this.color ? '\u001B[0m' : ''
      }`,
    )
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('LOG', message, optionalParams, '\u001B[32m')
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('FATAL', message, optionalParams, '\u001B[1m')
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('ERROR', message, optionalParams, '\u001B[31m')
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('WARN', message, optionalParams, '\u001B[33m')
  }

  debug?(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('DEBUG', message, optionalParams, '\u001B[35m')
  }

  verbose?(message: unknown, ...optionalParams: unknown[]) {
    this.printLog('VERBOSE', message, optionalParams, '')
  }
}
