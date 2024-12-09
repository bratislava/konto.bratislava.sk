import { HandleErrors } from './errorHandler.decorators'
import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import { RequiredError } from '../../generated-clients/new-magproxy/base'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

describe('HandleErrors', () => {
  let loggerPrototype: LineLoggerSubservice
  beforeEach(async () => {
    jest.clearAllMocks()
    loggerPrototype = LineLoggerSubservice.prototype
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loggerPrototype.error = (message: string) => {}
  })
  it('should catch and handle errors', async () => {
    class TestClass {
      @HandleErrors()
      async testMethod() {
        throw new Error('This is a test error')
      }
    }

    const loggerSpy = jest.spyOn(loggerPrototype, 'error')

    const t = new TestClass()

    // We expect testMethod to throw an error which should be caught and handled by the decorator
    await expect(t.testMethod()).resolves.toBe(null)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        String.raw`errorType="Error" message="This is a test error" method="testMethod"`
      )
    )
  })

  it('should catch and handle requiredErrors', async () => {
    class TestClass {
      @HandleErrors()
      async testMethod() {
        throw new RequiredError('This is a test requiredError', 'This is a message')
      }
    }

    const loggerSpy = jest.spyOn(loggerPrototype, 'error')

    const t = new TestClass()

    // We expect testMethod to throw an error which should be caught and handled by the decorator
    await expect(t.testMethod()).resolves.toBe(null)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        String.raw`errorType="RequiredError" message="This is a message" field="This is a test requiredError" method="testMethod"`
      )
    )
  })

  it('should catch and handle HttpExceptions', async () => {
    class TestClass {
      private throwerErrorGuard = new ThrowerErrorGuard()

      @HandleErrors()
      async testMethod() {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Error',
          'Console error',
          { key_value: 'value_value' }
        )
      }
    }

    const loggerSpy = jest.spyOn(loggerPrototype, 'error')

    const t = new TestClass()

    // We expect testMethod to throw an error which should be caught and handled by the decorator
    await expect(t.testMethod()).resolves.toBe(null)

    expect(loggerSpy).toHaveBeenCalledTimes(1)
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        String.raw`errorType="HttpException" statusCode="400" status="Bad Request" errorName="INTERNAL_SERVER_ERROR" message="Error" object="{\"key_value\":\"value_value\"}" alert="0" console="Console error" method="testMethod" stack="HttpException: Error\n    at ThrowerErrorGuard.LoggingHttpException`
      )
    )
  })
})
