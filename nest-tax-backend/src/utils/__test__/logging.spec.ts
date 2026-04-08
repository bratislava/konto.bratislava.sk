import { HttpException } from '@nestjs/common'

import { ErrorsEnum, ErrorSymbols } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import {
  errorToLogfmt,
  escapeForLogfmt,
  objToLogfmt,
  separateLogFromResponseObj,
  symbolKeysToStrings,
  toLogfmt,
} from '../logging'

describe('Testing logging:', () => {
  describe('objToLogfmt function', () => {
    it('should return the correct log format', () => {
      const obj = {
        name: 'John',
        age: 30,
        city: 'New York',
      }

      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe('name="John" age="30" city="New York"')
    })

    it('should handle empty objects', () => {
      const obj = {}
      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe('')
    })

    it('should handle single quote in string', () => {
      const obj = {
        name: "O'Brien",
      }
      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe('name="O\'Brien"')
    })

    it('should handle new line in string', () => {
      const obj = {
        address: '123 Main St.\nNew York, NY',
      }
      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe(String.raw`address="123 Main St.\nNew York, NY"`)
    })

    it('should handle complex object', () => {
      const obj = {
        key1: { subKey1: 'a', subKey2: 'b' },
        key2: { subKey2: 'c', subKey3: { subSubKey1: 'd' } },
      }
      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe(
        String.raw`key1="{\"subKey1\":\"a\",\"subKey2\":\"b\"}" key2="{\"subKey2\":\"c\",\"subKey3\":{\"subSubKey1\":\"d\"}}"`,
      )
    })

    it('should handle escaping strings', () => {
      const obj = {
        key: String.raw`a
   \ \\ \\\ \\\\ " "" """ \" "\"`,
      }
      const logfmt = objToLogfmt(obj)

      expect(logfmt).toBe(
        String.raw`key="a\n   \\ \\\\ \\\\\\ \\\\\\\\ \" \"\" \"\"\" \\\" \"\\\""`,
      )
    })
  })

  describe('symbolKeysToStrings function', () => {
    it('should return empty object for empty input', () => {
      expect(symbolKeysToStrings({})).toEqual({})
    })

    it('should preserve string-keyed properties unchanged', () => {
      const obj = { message: 'hello', statusCode: 500 }
      expect(symbolKeysToStrings(obj)).toEqual({
        message: 'hello',
        statusCode: 500,
      })
    })

    it('should convert a known symbol key to its encoded string key', () => {
      const obj = { [ErrorSymbols.alert]: 1 }
      expect(symbolKeysToStrings(obj)).toEqual({
        [ErrorSymbols.alert]: 1,
        '$Symbol-alert': 1,
      })
    })

    it('should convert all known symbol keys', () => {
      const obj = {
        [ErrorSymbols.alert]: 1,
        [ErrorSymbols.console]: 'console input',
        [ErrorSymbols.errorCause]: 'Error',
        [ErrorSymbols.causedByMessage]: 'cause message',
      }
      expect(symbolKeysToStrings(obj)).toEqual({
        [ErrorSymbols.alert]: 1,
        [ErrorSymbols.console]: 'console input',
        [ErrorSymbols.errorCause]: 'Error',
        [ErrorSymbols.causedByMessage]: 'cause message',
        '$Symbol-alert': 1,
        '$Symbol-console': 'console input',
        '$Symbol-errorCause': 'Error',
        '$Symbol-causedByMessage': 'cause message',
      })
    })

    it('should ignore symbols without a description', () => {
      const sym = Symbol()
      const obj = { [sym]: 'ignored' }
      expect(symbolKeysToStrings(obj)).toEqual({ [sym]: 'ignored' })
    })

    it('should ignore symbols whose description is not in errorTypeKeys', () => {
      const sym = Symbol('unknownKey')
      const obj = { [sym]: 'ignored' }
      expect(symbolKeysToStrings(obj)).toEqual({ [sym]: 'ignored' })
    })

    it('should handle mixed string keys, known symbol keys, and unknown symbol keys', () => {
      const unknownSym = Symbol('unknownKey')
      const noDescSym = Symbol()
      const obj = {
        message: 'hello',
        [ErrorSymbols.alert]: 1,
        [unknownSym]: 'ignored',
        [noDescSym]: 'also ignored',
      }
      expect(symbolKeysToStrings(obj)).toEqual({
        message: 'hello',
        [ErrorSymbols.alert]: 1,
        [unknownSym]: 'ignored',
        [noDescSym]: 'also ignored',
        '$Symbol-alert': 1,
      })
    })
  })

  describe('separateLogFromResponseObj function', () => {
    it('should separate log data and response data correctly', () => {
      const obj = {
        [Symbol('log')]: 'log data',
        res: 'response data',
        [Symbol('anotherLog')]: 'more log data',
        anotherRes: 'more response data',
      }

      const { responseLog, responseMessage } = separateLogFromResponseObj(obj)

      expect(responseLog).toEqual({
        log: 'log data',
        anotherLog: 'more log data',
      })

      expect(responseMessage).toEqual({
        res: 'response data',
        anotherRes: 'more response data',
      })
    })
  })

  describe('escapeForLogfmt function', () => {
    it('should escape string', () => {
      const escaped = escapeForLogfmt(String.raw`This is a\ " \ 
 string`)
      expect(escaped).toBe(String.raw`This is a\\ \" \\ \n string`)
    })
  })

  describe('errorToLogfmt function', () => {
    it('should stringify HttpException', () => {
      const error = new HttpException('Test error message', 500)
      const logfmt = errorToLogfmt(error, 'testMethod')
      expect(
        logfmt.startsWith(
          String.raw`errorType="HttpException" message="Test error message" method="testMethod" stack="HttpException: Test error message\n`,
        ),
      ).toBe(true)
    })

    it('should stringify HttpException from ThrowerErrorGuard', () => {
      const thrower = new ThrowerErrorGuard()
      const error = thrower.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Test message',
        'Custom status',
        'console input',
        new Error('Test error message'),
      )
      const logfmt = errorToLogfmt(error, 'testMethod')

      const expected = String.raw`errorType="HttpException" statusCode="500" status="Custom status" errorName="INTERNAL_SERVER_ERROR" message="Test message" alert="1" errorCause="Error" causedByMessage="Test error message" console="console input" method="testMethod" stack="HttpException: Test message`

      expect(logfmt).toContain(expected)
    })

    it('should strigify HttpException without alert', () => {
      const thrower = new ThrowerErrorGuard()
      const error = thrower.ForbiddenException(
        ErrorsEnum.FORBIDDEN_ERROR,
        'Test message',
        'Custom status',
        'console input',
        new Error('Test error message'),
      )
      const logfmt = errorToLogfmt(error, 'testMethod')

      const expected = String.raw`errorType="HttpException" statusCode="403" status="Custom status" errorName="FORBIDDEN_ERROR" message="Test message" alert="0" errorCause="Error" causedByMessage="Test error message" console="console input" method="testMethod" stack="HttpException: Test message`
      expect(logfmt).toContain(expected)
    })
  })

  describe('toLogfmt function', () => {
    it('should convert random string to logfmt', () => {
      const randomString = 'This is a \n " random string!'
      const result = toLogfmt(randomString)
      expect(result).toBe(String.raw`message="This is a \n \" random string!"`)
    })

    it('should convert logfmt string to logfmt', () => {
      const logfmtString = 'key="value"'
      const result = toLogfmt(logfmtString)
      expect(result).toBe('key="value"')
    })

    it('should convert object to logfmt', () => {
      const testObject = { key1: 'value1', key2: 'value2' }
      const result = toLogfmt(testObject)
      expect(result).toBe(`key1="${testObject.key1}" key2="${testObject.key2}"`)
    })

    it('should convert empty string with to logfmt', () => {
      const emptyString = ''
      const result = toLogfmt(emptyString)
      expect(result).toBe('')
    })

    it('should convert error to logfmt', () => {
      const error = new Error('Error message')
      const result = toLogfmt(error)
      expect(result).toContain(`errorType="${error.name}"`)
      expect(result).toContain(`message="${escapeForLogfmt(error.message)}"`)
      expect(result).toContain(`stack="Error: Error message\\n`)
    })
  })
})
