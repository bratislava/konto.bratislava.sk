import * as process from 'node:process'

import { LoggerService } from '@nestjs/common'

import { escapeForLogfmt, isLogfmt, toLogfmt } from '../logging'

// ANSI color escape codes
const ANSI_RESET = '\u001B[0m'
const ANSI_GREEN = '\u001B[32m'
const ANSI_BOLD = '\u001B[1m'
const ANSI_RED = '\u001B[31m'
const ANSI_YELLOW = '\u001B[33m'
const ANSI_MAGENTA = '\u001B[35m'
const ANSI_CYAN = '\u001B[36m'

// Color for keys in fancy logging
const FANCY_KEY_COLOR = ANSI_CYAN

function getCurrentDateTime(): string {
  return new Date().toISOString()
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
    return isLogfmt(messages) ? ' '.concat(messages) : `message="${escapeForLogfmt(messages)}"`
  }

  private printLog(
    severity: string,
    message: unknown,
    optionalParams: unknown[],
    colorCode: string
  ): void {
    const completeArray = [message, ...optionalParams]

    const stringMessages = completeArray
      .filter((item): item is string => typeof item === 'string')
      .join(' ')

    const otherItems = completeArray.filter((item): item is string => typeof item !== 'string')

    const formattedStringMessages = this.formatStringMessage(stringMessages)

    const formattedOtherItems = otherItems.map((item) => toLogfmt(item)).join(' ')

    const formattedContext = this.context ? `context="${this.context}"` : ''

    const colorStart = this.color ? colorCode : ''
    const colorEnd = this.color ? ANSI_RESET : ''

    // eslint-disable-next-line no-console
    const messageInLogFmt = [
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
      .join('')

    if (process.env.PRETTY_LOGGING === 'FANCY') {
      this.fancyPrint(messageInLogFmt, colorStart, colorEnd)
      return
    }

    console.log(messageInLogFmt)
  }

  private fancyPrint(messageInLogFmt: string, colorStart: string, colorEnd: string) {
    // Clean up and prepare
    const formatted = messageInLogFmt
      .replace(colorStart, '')
      .replace(colorEnd, '')
      .replace(/\\n/g, '\n')
      .replace(/\u001B\[\d+m/g, '')
      .replace(/ (?=\w+=)/g, '\n')
      .replace(/(\w+)=/g, `${FANCY_KEY_COLOR}$1${ANSI_RESET}: `)
    const MAX_LINE_WIDTH = (process.stdout.columns || 120) - 4

    // Split into separate lines
    const lineArr = formatted.split('\n')

    // Wrap long lines after '='
    const wrappedLines: string[] = []
    let lastPadding = 0
    lineArr.forEach((line) => {
      const cleanLine = line.replace(/\u001B\[\d+m/g, '')
      const colonIndex = cleanLine.indexOf(': ')
      if (colonIndex !== -1) {
        lastPadding = colonIndex + 2
      }

      if (cleanLine.length <= MAX_LINE_WIDTH) {
        wrappedLines.push(line)
      } else {
        const padding = colonIndex !== -1 ? colonIndex + 2 : lastPadding
        let remaining = colonIndex !== -1 ? line : ' '.repeat(padding).concat(line)

        while (remaining.length > 0) {
          const cleanRemaining = remaining.replace(/\u001B\[\d+m/g, '')
          if (cleanRemaining.length <= MAX_LINE_WIDTH) {
            wrappedLines.push(remaining)
            break
          }

          // Find the last `: ` within MAX_LINE_WIDTH
          const chunk = remaining.substring(0, MAX_LINE_WIDTH)
          const lastEqualIndex = chunk.indexOf(': ')

          if (lastEqualIndex > 0) {
            // Count ANSI codes up to the split point to adjust position
            const ansiMatches = [...chunk.matchAll(/\u001B\[\d+m/g)]
            let actualIndex = lastEqualIndex + 1
            for (const match of ansiMatches) {
              if (match.index! <= actualIndex) {
                actualIndex += match[0].length
              }
            }
            wrappedLines.push(remaining.substring(0, actualIndex))
            remaining = remaining.substring(actualIndex)
          } else {
            // No `: ` found, just break at MAX_LINE_WIDTH
            wrappedLines.push(remaining.substring(0, MAX_LINE_WIDTH))
            remaining = remaining.substring(MAX_LINE_WIDTH)
          }
          remaining = ' '.repeat(padding).concat(remaining)
        }
      }
    })

    const maxLength = Math.max(
      ...wrappedLines.map((line) => line.replace(/\u001B\[\d+m/g, '').length)
    )
    // Top border
    const border = '─'.repeat(maxLength + 2)
    console.log(`${colorStart}┌${border}┐${colorEnd}`)

    wrappedLines.forEach((line) => {
      const padding = ' '.repeat(maxLength - line.replace(/\u001B\[\d+m/g, '').length)
      console.log(`${colorStart}│${colorEnd} ${line}${padding} ${colorStart}│${colorEnd}`)
    })

    // Bottom border
    console.log(`${colorStart}└${border}┘${colorEnd}`)
    return
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
