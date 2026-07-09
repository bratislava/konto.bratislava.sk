import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parse } from 'dotenv'

import validateEnvironmentVariables from '../environment-variables.validate'

// Loaded from the repo's .env.spec fixture, so this test doubles as a check that the
// fixture itself (used by e2e tests) stays in sync with EnvironmentVariables.
const VALID_ENV = parse(readFileSync(resolve(__dirname, '../../../.env.spec')))

describe('validateEnvironmentVariables', () => {
  it('validates the .env.spec fixture without throwing', () => {
    expect(() => validateEnvironmentVariables(VALID_ENV)).not.toThrow()
  })

  it('throws when a required field is missing', () => {
    const withoutDatabaseUrl = { ...VALID_ENV, DATABASE_URL: undefined }
    expect(() => validateEnvironmentVariables(withoutDatabaseUrl)).toThrow()
  })

  it('still rejects an empty string for a required numeric field', () => {
    expect(() => validateEnvironmentVariables({ ...VALID_ENV, DB_CONCURRENCY: '' })).toThrow()
  })

  it('still rejects an unparseable value for a required boolean field', () => {
    expect(() => validateEnvironmentVariables({ ...VALID_ENV, REQUIRE_HTTPS: '1' })).toThrow()
  })

  it('parses OAUTH2_CLIENT_LIST into a trimmed string array', () => {
    const config = validateEnvironmentVariables({
      ...VALID_ENV,
      OAUTH2_CLIENT_LIST: 'DPB, PAAS_MPA',
    })
    expect(config.OAUTH2_CLIENT_LIST).toEqual(['DPB', 'PAAS_MPA'])
  })

  it('rejects an empty OAUTH2_CLIENT_LIST', () => {
    expect(() => validateEnvironmentVariables({ ...VALID_ENV, OAUTH2_CLIENT_LIST: '' })).toThrow()
  })
})
