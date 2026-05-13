/**
 * Unit tests for the shared-browser lifecycle in PdfGeneratorService.
 * Lives in its own file because it mocks `playwright` at the module level;
 * the integration test in pdf-generator.service.spec.ts needs the real one.
 */

import { Test, TestingModule } from '@nestjs/testing'
import { chromium } from 'playwright'

import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PdfGeneratorService } from './pdf-generator.service'

jest.mock('playwright', () => ({
  chromium: { launch: jest.fn() },
}))

const templateArgs = [
  'delivery-method-set-to-notification' as const,
  'test.pdf',
  { name: 'test', birthNumber: 'test', email: 'test', date: 'test' },
  'pw',
] as const

interface MockBrowser {
  newContext: jest.Mock
  close: jest.Mock
}

const buildMockPage = () => ({
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  close: jest.fn().mockResolvedValue(undefined),
})

const buildMockBrowser = (): MockBrowser => ({
  newContext: jest.fn().mockImplementation(async () => ({
    newPage: jest.fn().mockResolvedValue(buildMockPage()),
    close: jest.fn().mockResolvedValue(undefined),
  })),
  close: jest.fn().mockResolvedValue(undefined),
})

describe('PdfGeneratorService — shared browser lifecycle', () => {
  let service: PdfGeneratorService
  let launchMock: jest.Mock
  let mockBrowsers: MockBrowser[]

  beforeEach(async () => {
    mockBrowsers = []
    launchMock = chromium.launch as unknown as jest.Mock
    launchMock.mockReset()
    launchMock.mockImplementation(async () => {
      const browser = buildMockBrowser()
      mockBrowsers.push(browser)
      return browser
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService, ThrowerErrorGuard],
    }).compile()

    service = module.get<PdfGeneratorService>(PdfGeneratorService)

    jest
      .spyOn(service as any, 'addPasswordToPdf')
      .mockImplementation(async (buf: unknown) => buf as Buffer)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('generateFromTemplate calls inside withSharedBrowser reuse one browser', async () => {
    await service.withSharedBrowser(async () => {
      await service.generateFromTemplate(...templateArgs)
      await service.generateFromTemplate(...templateArgs)
      await service.generateFromTemplate(...templateArgs)

      expect(launchMock).toHaveBeenCalledTimes(1)
      expect(mockBrowsers[0].newContext).toHaveBeenCalledTimes(3)
      expect(mockBrowsers[0].close).not.toHaveBeenCalled() // still pinned by outer scope
    })

    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })

  it('releases the inner pin in finally when generateFromTemplate throws', async () => {
    await service.withSharedBrowser(async () => {
      mockBrowsers[0].newContext.mockImplementationOnce(async () => ({
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockRejectedValue(new Error('page.pdf boom')),
          close: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      }))

      await expect(service.generateFromTemplate(...templateArgs)).rejects.toThrow()

      expect(mockBrowsers[0].close).not.toHaveBeenCalled()
    })

    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })
})
