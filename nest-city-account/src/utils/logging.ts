/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from '@nestjs/common'
import { RequiredError } from '../generated-clients/new-magproxy/base'

/**
 * Escapes occurrences of the `"` and `\` characters in input string for logfmt compatibility
 * The function also replaces newline symbols with the "\n" (new line) string.
 *
 * Newline symbols create a new log entry in Grafana. By using this replacement approach, the
 * function ensures the entire log message remains on a single line, but information about line
 * breaks is preserved. Loki can correct this formatting with a single button click, without any
 * need for a query.
 */
export function escapeForLogfmt(value: string) {
  return value.replaceAll(/[\\"]/g, '\\$&').replaceAll('\n', '\\n')
}

/**
 * Separates log data from an object
 *
 * Splits an object into two. Keys that are a `Symbol` (with a description) or start with `$Symbol-`
 * will be put in one object and keys that are a string will be put in another. Keys with symbol as
 * a key will be replaced by their descriptions.
 */
export function separateLogFromResponseObj(obj: object) {
  const responseLog: Record<string, unknown> = {}
  const responseMessage: Record<string, unknown> = {}

  const keys = Object.getOwnPropertyNames(obj)
  const symbols = Object.getOwnPropertySymbols(obj)

  for (const key of keys) {
    if (key.startsWith('$Symbol-')) {
      responseLog[key.slice(8)] = (obj as any)[key]
    } else {
      responseMessage[key] = (obj as any)[key]
    }
  }

  for (const symbol of symbols) {
    if (symbol.description) {
      responseLog[symbol.description] = (obj as any)[symbol]
    }
  }

  return { responseLog, responseMessage }
}

/**
 * Takes and object and creates a flat one-line string representation.
 *
 * Example output
 *  "key1"="value1" "key2"="value2" "key3"="{ objectKey1: \"string with newline at the end\n\"}"
 *
 * If an object is present as a value, it will be converted to json string.
 * Return string does not contain any new line symbols - they will be replaced by '\n'.
 *
 * If a key is represented as a symbol, it will be included in the final output.
 */
export function objToLogfmt(obj: object): string {
  const separatedValues = separateLogFromResponseObj(obj)
  const objAll = { ...separatedValues.responseLog, ...separatedValues.responseMessage }
  return Object.entries(objAll)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      // not else if because we want to sanitize strings in object
      if (typeof value === 'string') {
        value = escapeForLogfmt(value)
      }

      return `${key}="${value}"`
    })
    .join(' ')
}

function httpExceptionToObj(error: HttpException, methodName?: string | symbol): object {
  const response = error.getResponse()
  try {
    const { responseLog, responseMessage } = separateLogFromResponseObj(
      typeof response === 'string' ? JSON.parse(response) : response
    )
    return {
      errorType: error.name,
      ...responseMessage,
      ...responseLog,
      method: methodName,
      stack: error.stack,
    }
  } catch (parseError) {
    return {
      errorType: error.name,
      message: error.message,
      method: methodName,
      stack: error.stack,
    }
  }
}

function requiredErrorToObj(error: RequiredError, methodName?: string | symbol): object {
  return {
    errorType: 'RequiredError',
    message: error.message,
    field: error.field,
    method: methodName,
    stack: error.stack,
  }
}

function genericErrorToObj(error: Error, methodName?: string | symbol): object {
  return {
    errorType: error.name,
    message: error.message,
    method: methodName,
    stack: error.stack,
  }
}

export function errorToLogfmt(error: unknown, methodName?: string | symbol): string {
  let logObj: object
  if (error instanceof HttpException) {
    logObj = httpExceptionToObj(error, methodName)
  } else if (error instanceof RequiredError) {
    logObj = requiredErrorToObj(error, methodName)
  } else if (error instanceof Error) {
    logObj = genericErrorToObj(error, methodName)
  } else {
    logObj = {
      errorType: 'UnknownError',
      message: 'Unknown error was thrown. This should not happen',
      method: methodName,
      alert: 1,
    }
  }
  return objToLogfmt(logObj)
}

export function isLogfmt(input: string): boolean {
  const regex = new RegExp(/((^| )[\w-_]+="([^"\\\n]|\\\\|\\"|\\n)*")+$/)
  return regex.test(input)
}

export function ToLogfmt(input: unknown): string {
  let message = ''
  if (!input) {
    return ''
  }
  if (input instanceof Error) {
    message = errorToLogfmt(input)
  } else if (typeof input === 'object') {
    message = objToLogfmt(input)
  } else if (typeof input === 'string') {
    if (isLogfmt(input)) {
      message = input
    } else {
      message = `message="${escapeForLogfmt(input)}"`
    }
  } else {
    message = `message="${escapeForLogfmt(input.toString())}"`
  }
  return message
}

/**
 * Converts keys in an object, that are `Symbol` into strings that start with '$Symbol-'
 */
export function symbolKeysToStrings(obj: object) {
  const response: Record<string, unknown> = {... obj}

  const symbols = Object.getOwnPropertySymbols(obj)

  for (const symbol of symbols) {
    if (symbol.description) {
      response[`$Symbol-${symbol.description}`] = (obj as any)[symbol]
    }
  }

  return response
}
