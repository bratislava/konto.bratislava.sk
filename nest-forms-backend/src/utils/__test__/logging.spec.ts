import { HttpException } from '@nestjs/common'

import { ErrorsEnum } from '../global-enums/errors.enum'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import {
  errorToLogfmt,
  escapeForLogfmt,
  objToLogfmt,
  separateLogFromResponseObj,
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
        'console input',
        new Error('Test error message'),
      )
      const logfmt = errorToLogfmt(error, 'testMethod')

      const expected = String.raw`errorType="HttpException" statusCode="500" status="Internal server error" errorName="INTERNAL_SERVER_ERROR" message="Test message" alert="1" errorCause="Error" causedByMessage="Test error message" console="console input" method="testMethod" stack="HttpException: Test message`

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
