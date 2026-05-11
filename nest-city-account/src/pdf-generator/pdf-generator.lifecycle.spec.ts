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

type MockBrowser = {
  newContext: jest.Mock
  newPage: jest.Mock
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
  newPage: jest.fn().mockImplementation(async () => buildMockPage()),
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

    // Bypass qpdf encryption — we only care about the browser lifecycle here.
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method access in test
      .spyOn(service as any, 'addPasswordToPdf')
      .mockImplementation(async (buf: unknown) => buf as Buffer)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('acquire release refcounts: 0→1 launches, last release closes', async () => {
    await service.acquireSharedBrowser()
    expect(launchMock).toHaveBeenCalledTimes(1)
    expect(mockBrowsers[0].close).not.toHaveBeenCalled()

    await service.releaseSharedBrowser()
    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })

  it('nested acquires share one browser; only the last release closes it', async () => {
    await service.acquireSharedBrowser()
    await service.acquireSharedBrowser()
    await service.acquireSharedBrowser()
    expect(launchMock).toHaveBeenCalledTimes(1)

    await service.releaseSharedBrowser()
    await service.releaseSharedBrowser()
    expect(mockBrowsers[0].close).not.toHaveBeenCalled()

    await service.releaseSharedBrowser()
    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })

  it('extra releases beyond the refcount are no-ops', async () => {
    await service.releaseSharedBrowser()
    await service.releaseSharedBrowser()
    expect(launchMock).not.toHaveBeenCalled()
  })

  it('generateFromTemplate reuses the pinned shared browser (one launch for N calls)', async () => {
    await service.acquireSharedBrowser()

    await service.generateFromTemplate(...templateArgs)
    await service.generateFromTemplate(...templateArgs)
    await service.generateFromTemplate(...templateArgs)

    expect(launchMock).toHaveBeenCalledTimes(1)
    expect(mockBrowsers[0].newContext).toHaveBeenCalledTimes(3)
    expect(mockBrowsers[0].newPage).not.toHaveBeenCalled() // own-browser path not taken
    expect(mockBrowsers[0].close).not.toHaveBeenCalled() // still pinned

    await service.releaseSharedBrowser()
    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })

  it('without a pin, generateFromTemplate launches and closes its own browser per call', async () => {
    await service.generateFromTemplate(...templateArgs)
    await service.generateFromTemplate(...templateArgs)

    expect(launchMock).toHaveBeenCalledTimes(2)
    expect(mockBrowsers).toHaveLength(2)
    expect(mockBrowsers[0].newContext).not.toHaveBeenCalled() // own-browser uses browser.newPage
    expect(mockBrowsers[0].newPage).toHaveBeenCalledTimes(1)
    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
    expect(mockBrowsers[1].close).toHaveBeenCalledTimes(1)
  })

  it('releases the pin in finally when the shared-branch throws', async () => {
    await service.acquireSharedBrowser()

    // Override the next newContext so page.pdf() rejects, exercising the catch+finally path.
    mockBrowsers[0].newContext.mockImplementationOnce(async () => ({
      newPage: jest.fn().mockResolvedValue({
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockRejectedValue(new Error('page.pdf boom')),
        close: jest.fn().mockResolvedValue(undefined),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    }))

    await expect(service.generateFromTemplate(...templateArgs)).rejects.toThrow()

    // The inner pin should have been released by the finally; releasing our outer pin
    // takes refcount to 0 and closes the browser.
    expect(mockBrowsers[0].close).not.toHaveBeenCalled()
    await service.releaseSharedBrowser()
    expect(mockBrowsers[0].close).toHaveBeenCalledTimes(1)
  })
})
