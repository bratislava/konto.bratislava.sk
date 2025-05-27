import * as process from 'node:process'

import { LoggerService } from '@nestjs/common'

import { escapeForLogfmt, isLogfmt, ToLogfmt } from '../logging'

// ANSI color escape codes
const ANSI_RESET = '\u001B[0m'
const ANSI_GREEN = '\u001B[32m'
const ANSI_BOLD = '\u001B[1m'
const ANSI_RED = '\u001B[31m'
const ANSI_YELLOW = '\u001B[33m'
const ANSI_MAGENTA = '\u001B[35m'

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

  private formatStringMessage(messages: string): string {
    if (messages.length === 0) return ''
    return isLogfmt(messages)
      ? ' '.concat(messages)
      : `message="${escapeForLogfmt(messages)}"`
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

    const formattedStringMessages = this.formatStringMessage(stringMessages)

    const formattedOtherItems = otherItems
      .map((item) => ToLogfmt(item))
      .join(' ')

    const formattedContext = this.context ? `context="${this.context}"` : ''

    const colorStart = this.color ? colorCode : ''
    const colorEnd = this.color ? ANSI_RESET : ''

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
    this.printLog('LOG', message, optionalParams, ANSI_GREEN)
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('FATAL', message, optionalParams, ANSI_BOLD)
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('ERROR', message, optionalParams, ANSI_RED)
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('WARN', message, optionalParams, ANSI_YELLOW)
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('DEBUG', message, optionalParams, ANSI_MAGENTA)
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.printLog('VERBOSE', message, optionalParams, '')
  }
}

// TODO use ThrowerErrorGuard instead ()
export default function alertError(
  message: string,
  logger: LineLoggerSubservice,
  error?: unknown,
): void {
  if (error instanceof Error) {
    logger.error({ alertMessage: message, alert: 1 }, error)
  } else {
    logger.error({ alertMessage: message, alert: 1 }, <string>error)
  }
}
