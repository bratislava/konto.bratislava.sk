/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from '@nestjs/common'

import { RequiredError } from '../generated-clients/new-magproxy/base'
import { errorTypeKeys, errorTypeStrings } from './guards/dtos/error.dto'

/**
 * Escapes occurrences of the `"` and `\` characters in input string for logfmt compatibility
 * The function also replaces newline symbols with the "\n" (new line) string.
 *
 * Newline symbols create a new log entry in Grafana. By using this replacement approach, the
 * function ensures the entire log message remains on a single line, but information about line
 * breaks is preserved. Loki can correct this formatting with a single button click, without any
 * need for a query.
 */
export function escapeForLogfmt(value: string): string {
  return value
    .replaceAll(/["\\]/g, String.raw`\$&`)
    .replaceAll('\n', String.raw`\n`)
}

/**
 * Separates log data from an object
 *
 * Splits an object into two. Keys that are a `Symbol` (with a description) or start with `$Symbol-`
 * will be put in one object and keys that are a string will be put in another. Keys with symbol as
 * a key will be replaced by their descriptions.
 */
export function separateLogFromResponseObj<T extends object>(
  obj: T,
): {
  responseLog: { [K: string]: T[keyof T] }
  responseMessage: { [K: string]: T[keyof T] }
} {
  const responseLog: ReturnType<
    typeof separateLogFromResponseObj
  >['responseLog'] = {}
  const responseMessage: ReturnType<
    typeof separateLogFromResponseObj
  >['responseLog'] = {}

  Object.getOwnPropertyNames(obj).forEach((objKey) => {
    if (errorTypeStrings.includes(objKey)) {
      responseLog[objKey.slice(8)] = obj[objKey as keyof T]
    } else {
      responseMessage[objKey] = obj[objKey as keyof T]
    }
  })

  Object.getOwnPropertySymbols(obj).forEach((symbol) => {
    if (symbol.description) {
      responseLog[symbol.description] = obj[symbol as keyof T]
    }
  })

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
  const objAll = {
    ...separatedValues.responseLog,
    ...separatedValues.responseMessage,
  }
  return Object.entries(objAll)
    .map(([key, value]) => {
      let formattedValue: unknown = value
      if (typeof formattedValue === 'object') {
        formattedValue = JSON.stringify(formattedValue)
      }
      // not else if because we want to sanitize strings in objects
      if (typeof formattedValue === 'string') {
        formattedValue = escapeForLogfmt(formattedValue)
      }

      return `${key}="${formattedValue}"`
    })
    .join(' ')
}

function httpExceptionToObj(
  error: HttpException,
  methodName?: string | symbol,
): object {
  const response = error.getResponse()
  try {
    const { responseLog, responseMessage } = separateLogFromResponseObj(
      typeof response === 'string' ? JSON.parse(response) : response,
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

function requiredErrorToObj(
  error: RequiredError,
  methodName?: string | symbol,
): object {
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

export function errorToLogfmt(
  error: unknown,
  methodName?: string | symbol,
): string {
  if (error instanceof HttpException) {
    return objToLogfmt(httpExceptionToObj(error, methodName))
  }
  if (error instanceof RequiredError) {
    return objToLogfmt(requiredErrorToObj(error, methodName))
  }
  if (error instanceof Error) {
    return objToLogfmt(genericErrorToObj(error, methodName))
  }
  return objToLogfmt({
    errorType: 'UnknownError',
    message: 'Unknown error was thrown. This should not happen',
    method: methodName,
    alert: 1,
  })
}

export function isLogfmt(input: string): boolean {
  const regex = /((^| )\w+="([^\n"\\]|\\\\|\\"|\\n)*")+$/
  return regex.test(input)
}

export function ToLogfmt(input: unknown): string {
  if (!input) {
    return ''
  }
  if (input instanceof Error) {
    return errorToLogfmt(input)
  }
  if (typeof input === 'object') {
    return objToLogfmt(input)
  }
  if (typeof input === 'string') {
    return isLogfmt(input) ? input : `message="${escapeForLogfmt(input)}"`
  }
  return `message="${escapeForLogfmt(input.toString())}"`
}

/**
 * Converts keys in an object, that are `Symbol` into strings that start with '$Symbol-'
 */
export function symbolKeysToStrings(obj: object): Record<string, unknown> {
  const response: Record<string, unknown> = { ...obj }

  const symbols = Object.getOwnPropertySymbols(obj)

  symbols.forEach((symbol) => {
    const { description } = symbol
    if (description) {
      const encodedKey = errorTypeKeys[description]
      if (encodedKey) {
        response[encodedKey] = (obj as any)[symbol]
      }
    }
  })

  return response
}
