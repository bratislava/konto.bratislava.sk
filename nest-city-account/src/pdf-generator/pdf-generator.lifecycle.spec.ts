/**
 * Unit tests for the shared-browser lifecycle in PdfGeneratorService.
 * Lives in its own file because it mocks `playwright` at the module level;
 * the integration test in pdf-generator.service.spec.ts needs the real one.
 */

import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'
import { chromium } from 'playwright'
import type { Mock } from 'vitest'

import BaConfig from '../config/ba-config'
import BaConfigService from '../config/ba-config.service'
import EnvironmentVariables from '../config/environment-variables'
import { PdfGeneratorService } from './pdf-generator.service'

vi.mock('playwright', () => ({
  chromium: { launch: vi.fn() },
}))

const templateArgs = [
  'delivery-method-set-to-notification' as const,
  'test.pdf',
  { name: 'test', birthNumber: 'test', email: 'test', date: 'test' },
  'pw',
] as const

interface MockBrowser {
  newContext: Mock
  close: Mock
}

const buildMockPage = () => ({
  setContent: vi.fn().mockResolvedValue(undefined),
  pdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  close: vi.fn().mockResolvedValue(undefined),
})

const buildMockBrowser = (): MockBrowser => ({
  newContext: vi.fn().mockImplementation(() => ({
    newPage: vi.fn().mockResolvedValue(buildMockPage()),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  close: vi.fn().mockResolvedValue(undefined),
})

describe('PdfGeneratorService — shared browser lifecycle', () => {
  let service: PdfGeneratorService
  let launchMock: Mock
  let mockBrowsers: MockBrowser[]

  beforeEach(async () => {
    mockBrowsers = []
    launchMock = vi.mocked(chromium.launch)
    launchMock.mockReset()
    launchMock.mockImplementation(() => {
      const browser = buildMockBrowser()
      mockBrowsers.push(browser)
      return browser
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoggerService,
        PdfGeneratorService,
        ErrorFactoryService,
        {
          provide: BaConfigService,
          // `playwright` is mocked at the module level above, so the value here is
          // inert - kept as a real BaConfig instance for consistency with
          // pdf-generator.service.spec.ts.
          useValue: new BaConfig({
            PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          } as EnvironmentVariables),
        },
      ],
    }).compile()

    service = module.get<PdfGeneratorService>(PdfGeneratorService)

    vi.spyOn(service, 'addPasswordToPdf').mockResolvedValue(Buffer.from('mock-encrypted-pdf'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
      mockBrowsers[0].newContext.mockImplementationOnce(() => ({
        newPage: vi.fn().mockResolvedValue({
          setContent: vi.fn().mockResolvedValue(undefined),
          pdf: vi.fn().mockRejectedValue(new Error('page.pdf boom')),
          close: vi.fn().mockResolvedValue(undefined),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }))

      await expect(service.generateFromTemplate(...templateArgs)).rejects.toThrow()

      expect(mockBrowsers[0].close).not.toHaveBeenCalled()
    })

    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })
})
