import { LineLoggerSubservice } from '../line-logger.subservice'

describe('LineLoggerService', () => {
  let service: LineLoggerSubservice
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
    service[method as keyof LineLoggerSubservice]('test message')

    const regex = new RegExp(
      `process="\\[Nest\\]" processPID="\\d+" datetime="\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z" severity="${severity}" context="LineLogger TEST" message="test message"`,
    )

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(regex))
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })

  it('should print log message with object as message', () => {
    // const objMessage = {foo: "string", goo: 'string\n"abc" def', sub: {foo: "data"}};
    service.log({ foo: 'string' })

    const regex =
      /process="\[Nest]" processPID="\d+" datetime="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z" severity="LOG" context="LineLogger TEST" foo="string"/

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(regex))
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })
})
