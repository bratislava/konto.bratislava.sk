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
      .map((item) => toLogfmt(item))
      .join(' ')

    const formattedContext = this.context ? `context="${this.context}"` : ''

    const colorStart = this.color ? colorCode : ''
    const colorEnd = this.color ? ANSI_RESET : ''

    // eslint-disable-next-line no-console
    const messageInLogFmt = [
      colorStart,
      [
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

  private wrapLineWithAnsi(line: string, maxWidth: number): string[] {
    const result: string[] = []

    // Calculate left padding based on first colon position (for continuation lines)
    const cleanLine = line.replace(/\u001B\[\d+m/g, '')
    const firstLineColonIndex = cleanLine.indexOf(': ')
    const continuationPadding =
      firstLineColonIndex >= 0 ? firstLineColonIndex + 2 : 0

    let pos = 0
    let visibleChars = 0
    let currentLine = ''
    let activeAnsiCodes = ''
    let inAnsiSequence = false
    let ansiBuffer = ''

    // Safety guard: prevent endless loops
    const maxIterations = line.length * 2
    let iterations = 0

    while (pos < line.length) {
      if (++iterations > maxIterations) {
        // Failsafe: just push remaining content and break
        currentLine += line.substring(pos)
        break
      }

      const char = line[pos]
      const next = line[pos + 1]

      if (char === '\u001B' && next === '[') {
        inAnsiSequence = true
        ansiBuffer = char
        currentLine += char
        pos++
        continue
      }

      if (inAnsiSequence) {
        ansiBuffer += char
        currentLine += char

        if (char === 'm') {
          inAnsiSequence = false
          activeAnsiCodes += ansiBuffer
          ansiBuffer = ''
        }
        pos++
        continue
      }

      if (char === '\\' && next === 'n') {
        result.push(currentLine)

        currentLine = ' '.repeat(continuationPadding) + activeAnsiCodes
        visibleChars = continuationPadding

        pos += 2 // Skip both \ and n
        continue
      }

      if (char === '\n') {
        result.push(currentLine)

        currentLine = ' '.repeat(continuationPadding) + activeAnsiCodes
        visibleChars = continuationPadding

        pos++
        continue
      }

      if (visibleChars >= maxWidth) {
        result.push(currentLine)

        currentLine = ' '.repeat(continuationPadding) + activeAnsiCodes
        visibleChars = continuationPadding

        // Don't increment pos - process current char on next line
        continue
      }

      currentLine += char
      visibleChars++
      pos++
    }

    // Push final line if any content remains
    if (currentLine.trim().length > 0) {
      result.push(currentLine)
    }

    return result.length > 0 ? result : [line]
  }

  private fancyPrint(
    messageInLogFmt: string,
    colorStart: string,
    colorEnd: string,
  ) {
    // Clean up and prepare
    const formatted = messageInLogFmt
      .replace(colorStart, '')
      .replace(colorEnd, '')
      //.replace(/\\n/g, '\n')
      .replace(/\u001B\[\d+m/g, '')
      .replace(/ (?=\w+=)/g, '\n')
      .replace(/(\w+)=/g, `${FANCY_KEY_COLOR}$1${ANSI_RESET}: `)
    const MAX_LINE_WIDTH = (process.stdout.columns || 120) - 4

    // Split into separate lines
    const lineArr = formatted.split('\n')

    // Wrap long lines using state machine
    const wrappedLines: string[] = []
    lineArr.forEach((line) => {
      const cleanLine = line.replace(/\u001B\[\d+m/g, '')

      if (cleanLine.length <= MAX_LINE_WIDTH) {
        wrappedLines.push(line)
      } else {
        const wrapped = this.wrapLineWithAnsi(line, MAX_LINE_WIDTH)
        wrappedLines.push(...wrapped)
      }
    })

    const maxLength = Math.max(
      ...wrappedLines.map((line) => line.replace(/\u001B\[\d+m/g, '').length),
    )
    // Top border
    const border = '─'.repeat(maxLength + 2)
    console.log(`${colorStart}┌${border}┐${colorEnd}`)

    wrappedLines.forEach((line) => {
      const rightPadding = ' '.repeat(
        maxLength - line.replace(/\u001B\[\d+m/g, '').length,
      )
      console.log(
        `${colorStart}│${colorEnd} ${line}${rightPadding} ${colorStart}│${colorEnd}`,
      )
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
