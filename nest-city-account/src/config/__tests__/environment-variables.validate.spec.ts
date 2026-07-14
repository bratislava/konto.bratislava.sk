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

  /**
   * OAUTH2_CLIENTS is derived from OAUTH2_{PREFIX}_* variables for every name in
   * OAuth2ClientName plus OAUTH2_CLIENT_LIST - see oauth2-client-env.parser.ts. An invalid
   * or missing entry must fail config validation the same way any other required
   * environment variable does, since bad client config used to fail silently at runtime.
   */
  describe('OAUTH2_CLIENTS', () => {
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

    it('parses a valid client configuration for every well-known and listed client', () => {
      const config = validateEnvironmentVariables(VALID_ENV)
      expect(config.OAUTH2_CLIENTS).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'dpb-client-id', name: 'DPB' }),
          expect.objectContaining({ id: 'paas-mpa-client-id', name: 'PAAS_MPA' }),
        ])
      )
    })

    it('throws when a well-known client is missing CLIENT_ID', () => {
      const withoutClientId = { ...VALID_ENV, OAUTH2_DPB_CLIENT_ID: undefined }
      expect(() => validateEnvironmentVariables(withoutClientId)).toThrow()
    })

    it('throws when a client is missing ALLOWED_URIS', () => {
      const withoutUris = { ...VALID_ENV, OAUTH2_PAAS_MPA_ALLOWED_URIS: undefined }
      expect(() => validateEnvironmentVariables(withoutUris)).toThrow()
    })

    it('throws when a public client (no secret) does not require PKCE', () => {
      // RFC 9700 Section 2.1.1: public clients MUST use PKCE.
      const publicClientNoPkce = { ...VALID_ENV, OAUTH2_PAAS_MPA_REQUIRES_PKCE: 'false' }
      expect(() => validateEnvironmentVariables(publicClientNoPkce)).toThrow()
    })

    it('defaults requiresPkce to true and allows an absent secret', () => {
      const config = validateEnvironmentVariables(VALID_ENV)
      const paasMpa = config.OAUTH2_CLIENTS.find((client) => client.name === 'PAAS_MPA')
      expect(paasMpa?.requiresPkce).toBe(true)
      expect(paasMpa?.secret).toBeUndefined()
    })

    it('includes a client from OAUTH2_CLIENT_LIST that is not a well-known name', () => {
      const withExtraClient = {
        ...VALID_ENV,
        OAUTH2_CLIENT_LIST: 'DPB,PAAS_MPA,CUSTOM',
        OAUTH2_CUSTOM_CLIENT_ID: 'custom-id',
        OAUTH2_CUSTOM_ALLOWED_URIS: 'https://custom.example.com/cb',
      }
      const config = validateEnvironmentVariables(withExtraClient)
      expect(config.OAUTH2_CLIENTS).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'custom-id', name: 'CUSTOM' })])
      )
    })
  })
})
