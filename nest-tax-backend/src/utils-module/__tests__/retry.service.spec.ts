import { Test, TestingModule } from '@nestjs/testing'

import { RetryService } from '../retry.service'

describe('RetryService', () => {
  let service: RetryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryService],
    }).compile()
    service = module.get<RetryService>(RetryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('retryWithDelay', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should succeed on first attempt without retry', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const result = await service['retryWithDelay'](mockFn, 'test', 3, 1000)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(logMock).not.toHaveBeenCalled()
    })

    it('should retry specified number of times before succeeding', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should throw error if all retries fail', async () => {
      jest.useRealTimers()

      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('First attempt failed'))
        .mockRejectedValue(new Error('Second attempt failed'))
        .mockRejectedValue(new Error('Third attempt failed'))

      await expect(
        service['retryWithDelay'](mockFn, 'test', 3, 10),
      ).rejects.toThrow('Third attempt failed')
    })

    it('should use default retry count and delay when not specified', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')

      const result = await service['retryWithDelay'](mockFn, 'test')

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle zero retries correctly', async () => {
      const error = new Error('Immediate failure')
      const mockFn = jest.fn().mockRejectedValue(error)
      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      await expect(
        service['retryWithDelay'](mockFn, 'test', 0, 1000),
      ).rejects.toThrow('Immediate failure')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(logMock).not.toHaveBeenCalled()
    })

    it('should handle different delay values correctly', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('success')

      jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 2, 5000)

      // Fast-forward through the delay
      await jest.advanceTimersByTimeAsync(5000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle very small delay values', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 2, 100)

      // Fast-forward through the delay
      await jest.advanceTimersByTimeAsync(100)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(logMock).toHaveBeenCalledWith(
        'Retry attempt failed for function test. Retrying in 0.10 seconds. Remaining retries: 1',
        expect.any(String),
      )
    })

    it('should handle function that throws different types of errors', async () => {
      const error1 = new TypeError('Type error')
      const error2 = new ReferenceError('Reference error')
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle function that throws non-Error objects', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce('String error')
        .mockRejectedValueOnce({ message: 'Object error' })
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle function that throws null or undefined', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(null)
        .mockRejectedValueOnce(null)
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle recursive retry calls correctly', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockRejectedValueOnce(new Error('Third attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 'test', 4, 1000)

      // Fast-forward through all delays
      await jest.advanceTimersByTimeAsync(3000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(4)
      expect(logMock).toHaveBeenCalledTimes(3)
    })
  })
})
