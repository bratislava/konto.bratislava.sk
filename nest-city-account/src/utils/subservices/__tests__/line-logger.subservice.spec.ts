import { LineLoggerSubservice } from '../line-logger.subservice'

describe('LineLoggerService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any // Changed from LineLoggerService
   let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    service = new LineLoggerSubservice('LineLogger TEST')
    consoleSpy = jest.spyOn(console, 'log')
    consoleSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  test.each([
    ['log', 'LOG'],
    ['error', 'ERROR'],
    ['warn', 'WARN'],
    ['debug', 'DEBUG'],
    ['verbose', 'VERBOSE'],
    ['fatal', 'FATAL'],
  ])('should print %s message with severity %s', (method, severity) => {
    service[method]('test message')

    const regex = new RegExp(
      `process="\\[Nest\\]" processPID="\\d+" datetime="\\d{2}\\/\\d{2}\\/\\d{4}, \\d{2}:\\d{2}:\\d{2} (AM|PM)" severity="${severity}" context="LineLogger TEST" message="test message"`
    )

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(regex))
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })

  it('should print log message with object as message', () => {
    // const objMessage = {foo: "string", goo: 'string\n"abc" def', sub: {foo: "data"}};
    service.log({ foo: 'string' })

    const regex = new RegExp(
      `process="\\[Nest\\]" processPID="\\d+" datetime="\\d{2}\\/\\d{2}\\/\\d{4}, \\d{2}:\\d{2}:\\d{2} (AM|PM)" severity="LOG" context="LineLogger TEST" foo="string"`
    )

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(regex))
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })
})
