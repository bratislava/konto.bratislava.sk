import { OAuth2ClientName } from './oauth2-client-name.enum'

export interface OAuth2ClientEnvConfig {
  id: string
  secret?: string
  name: string
  allowedRedirectUris: string[]
  allowedScopes: string[]
  allowedGrantTypes: string[]
  requiresPkce: boolean
}

function parseCommaSeparatedList(value: unknown): string[] {
  if (typeof value !== 'string' || value.length === 0) {
    return []
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function readString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * Parse and validate OAuth2 client configuration from raw environment variables.
 * Environment variable pattern: OAUTH2_{PREFIX}_{PROPERTY}
 *
 * Every well-known client name (OAuth2ClientName) plus every name listed in
 * OAUTH2_CLIENT_LIST must resolve to a fully valid client configuration - an invalid or
 * missing entry throws, failing config validation the same way any other required
 * environment variable would.
 */
export function parseOAuth2ClientsFromEnv(env: Record<string, unknown>): OAuth2ClientEnvConfig[] {
  const enumClientNames = Object.values(OAuth2ClientName)
  const envClientNames = parseCommaSeparatedList(env.OAUTH2_CLIENT_LIST)
  const clientNames = new Set<string>([...enumClientNames, ...envClientNames])

  const clients: OAuth2ClientEnvConfig[] = []
  const errors: string[] = []

  for (const name of clientNames) {
    const clientId = readString(env, `OAUTH2_${name}_CLIENT_ID`)
    const clientSecret = readString(env, `OAUTH2_${name}_CLIENT_SECRET`)

    if (!clientId) {
      errors.push(`OAUTH2_${name}_CLIENT_ID is required`)
      continue
    }

    const allowedRedirectUris = parseCommaSeparatedList(env[`OAUTH2_${name}_ALLOWED_URIS`])
    if (allowedRedirectUris.length === 0) {
      errors.push(`OAUTH2_${name}_ALLOWED_URIS is required and must contain at least one URI`)
      continue
    }

    const allowedScopes = parseCommaSeparatedList(env[`OAUTH2_${name}_ALLOWED_SCOPES`])
    const allowedGrantTypes = parseCommaSeparatedList(env[`OAUTH2_${name}_ALLOWED_GRANT_TYPES`])

    // Default to true if not specified
    const requiresPkce = env[`OAUTH2_${name}_REQUIRES_PKCE`] !== 'false'

    if (!clientSecret && !requiresPkce) {
      // https://datatracker.ietf.org/doc/html/rfc9700#section-2.1.1
      errors.push(
        `OAUTH2_${name}: public clients MUST use PKCE (set OAUTH2_${name}_REQUIRES_PKCE=true or provide OAUTH2_${name}_CLIENT_SECRET)`
      )
      continue
    }

    clients.push({
      id: clientId,
      secret: clientSecret,
      name,
      allowedRedirectUris,
      allowedScopes,
      allowedGrantTypes,
      requiresPkce,
    })
  }

  if (errors.length > 0) {
    throw new Error(`Invalid OAuth2 client configuration:\n${errors.join('\n')}`)
  }

  return clients
}
