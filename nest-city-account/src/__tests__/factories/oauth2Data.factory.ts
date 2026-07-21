import { OAuth2Data } from '../../generated/prisma/client'

export const oauth2DataFactory = (overrides: Partial<OAuth2Data> = {}): OAuth2Data => ({
  id: '22222222-2222-2222-2222-222222222222',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  responseType: 'code',
  clientId: 'client-id',
  redirectUri: 'https://example.com/callback',
  scope: 'read',
  state: 'csrf-state',
  codeChallenge: 'code-challenge',
  codeChallengeMethod: 'S256',
  authorizationCode: null,
  authorizationCodeCreatedAt: null,
  accessTokenEnc: null,
  accessTokenExpiresAt: null,
  idTokenEnc: null,
  refreshTokenEnc: null,
  ...overrides,
})
