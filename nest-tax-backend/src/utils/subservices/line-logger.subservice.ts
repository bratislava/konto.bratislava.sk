import * as process from 'node:process'

import { LoggerService } from '@nestjs/common'

import { escapeForLogfmt, isLogfmt, ToLogfmt } from '../logging'

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
  ): void {
    const completeArray = [message, ...optionalParams]

    const stringMessages = completeArray
      .filter((item): item is string => typeof item === 'string')
      .join(' ')

    const otherItems = completeArray.filter(
      (item): item is string => typeof item !== 'string',
    )

    const formattedStringMessages =
      stringMessages.length > 0
        ? isLogfmt(stringMessages)
          ? ' '.concat(stringMessages)
          : `message="${escapeForLogfmt(stringMessages)}"`
        : ''

    const formattedOtherItems = otherItems
      .map((item) => ToLogfmt(item))
      .join(' ')

    const formattedContext = this.context ? `context="${this.context}"` : ''

    const colorStart = this.color ? colorCode : ''
    const colorEnd = this.color ? '\u001B[0m' : ''

    // eslint-disable-next-line no-console
    console.log(
      [
        colorStart,
        [
          `process="[Nest]"`,
          `processPID="${process.pid}"`,
          `datetime="${getCurrentDateTime()}"`,
          `severity="${severity}"`,
          formattedContext,
          formattedStringMessages,
          formattedOtherItems,
        ]
          .filter(Boolean)
          .join(' '),
        colorEnd,
      ]
        .filter(Boolean)
        .join(''),
    )
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('LOG', message, optionalParams, '\u001B[32m')
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('FATAL', message, optionalParams, '\u001B[1m')
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('ERROR', message, optionalParams, '\u001B[31m')
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('WARN', message, optionalParams, '\u001B[33m')
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('DEBUG', message, optionalParams, '\u001B[35m')
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('VERBOSE', message, optionalParams, '')
  }
}
