export const mockNorisConnectionSubservice = {
  createConnection: jest.fn(),
  createOptimizedConnection: jest.fn(),
  waitForConnection: jest.fn(),
}

// Mock for ConnectionPool
export const mockConnectionPool = {
  connected: true,
  close: jest.fn(),
  request: jest.fn(),
}

// Complete mock setup for testing
export const createNorisConnectionSubserviceMock = () => {
  const mock = {
    createConnection: jest.fn().mockResolvedValue(mockConnectionPool),
    createOptimizedConnection: jest.fn().mockResolvedValue(mockConnectionPool),
    waitForConnection: jest.fn().mockResolvedValue(undefined),
  }

  return mock
}

// Mock dependencies
export const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
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
  InternalServerErrorException: jest
    .fn()
    .mockImplementation((error, message) => {
      return new Error(message)
    }),
}

// Usage in tests
export const setupNorisConnectionSubserviceTest = () => {
  const mockService = createNorisConnectionSubserviceMock()

  beforeEach(() => {
    jest.clearAllMocks()
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
