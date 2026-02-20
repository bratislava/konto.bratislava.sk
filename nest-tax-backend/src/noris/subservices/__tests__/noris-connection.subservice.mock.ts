import { beforeEach } from "vitest";
import { beforeEach, vi } from "vitest";
export const mockNorisConnectionSubservice = {
  createConnection: vi.fn(),
  createOptimizedConnection: vi.fn(),
  waitForConnection: vi.fn(),
}

// Mock for ConnectionPool
export const mockConnectionPool = {
  connected: true,
  close: vi.fn(),
  request: vi.fn(),
}

// Complete mock setup for testing
export const createNorisConnectionSubserviceMock = () => {
  const mock = {
    createConnection: vi.fn().mockResolvedValue(mockConnectionPool),
    createOptimizedConnection: vi.fn().mockResolvedValue(mockConnectionPool),
    // eslint-disable-next-line unicorn/no-useless-undefined
    waitForConnection: vi.fn().mockResolvedValue(undefined),
  }

  return mock
}

// Mock dependencies
export const mockConfigService = {
  getOrThrow: vi.fn((key: string) => {
    const mockEnvs: { [key: string]: string } = {
      MSSQL_HOST: 'localhost',
      MSSQL_DB: 'test_db',
      MSSQL_USERNAME: 'test_user',
      MSSQL_PASSWORD: 'test_password',
    }
    return mockEnvs[key] || 'default_value'
  }),
}

export const mockThrowerErrorGuard = {
  InternalServerErrorException: vi
    .fn()
    .mockImplementation((error, message) => {
      return new Error(message)
    }),
}

// Usage in tests
export const setupNorisConnectionSubserviceTest = () => {
  const mockService = createNorisConnectionSubserviceMock()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset connection pool state
    mockConnectionPool.connected = true
  })

  return {
    mockService,
    mockConfigService,
    mockThrowerErrorGuard,
    mockConnectionPool,
  }
}
