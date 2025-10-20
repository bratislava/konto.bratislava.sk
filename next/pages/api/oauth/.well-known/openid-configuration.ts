import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * OpenID Connect Discovery Document
 *
 * Returns the OpenID configuration for this OAuth provider.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const baseUrl = process.env.OAUTH_BASE_URL || 'https://konto.bratislava.sk'
    const cognitoRegion = process.env.AWS_COGNITO_REGION
    const cognitoUserPoolId = process.env.AWS_COGNITO_USERPOOL_ID

    const config = {
      issuer: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`,
      authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
      token_endpoint: `${baseUrl}/api/oauth/token`,
      userinfo_endpoint: `${baseUrl}/api/oauth/userinfo`,
      jwks_uri: `${baseUrl}/api/oauth/.well-known/jwks.json`,
      end_session_endpoint: `${baseUrl}/api/oauth/logout`,
      response_types_supported: ['code', 'token'],
      grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email', 'phone', 'aws.cognito.signin.user.admin'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      claims_supported: [
        'sub',
        'email',
        'email_verified',
        'name',
        'given_name',
        'family_name',
        'phone_number',
        'phone_number_verified',
      ],
      code_challenge_methods_supported: ['S256', 'plain'],
    }

    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json(config)
  } catch (error) {
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}
