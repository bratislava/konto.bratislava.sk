# OAuth SSO Integration Guide

This guide explains how the OAuth proxy works with Single Sign-On (SSO) for seamless partner integration.

## Overview

The OAuth implementation acts as a proxy between your partners (DPB, MPA) and AWS Cognito, while providing **seamless Single Sign-On (SSO)**. This means:

- If a user is already logged into your Next.js application and a partner redirects them for OAuth authorization, **they won't need to log in again**
- The OAuth flow automatically detects existing sessions and continues without interruption
- Users only log in once, and that session works for both your app and partner integrations

## How SSO Works

### 1. **User Already Logged In** (SSO Flow)

```
Partner (DPB/MPA)
    ↓ (redirects user to authorize)
Your OAuth Endpoint (/oauth/authorize)
    ↓ (detects existing Cognito session via cookies)
AWS Cognito OAuth
    ↓ (automatically authorizes without login prompt)
Partner Redirect URI (with authorization code)
```

**User Experience:** Completely seamless - user doesn't see any login page, authorization happens automatically.

### 2. **User Not Logged In** (First-Time Flow)

```
Partner (DPB/MPA)
    ↓ (redirects user to authorize)
Your OAuth Endpoint (/oauth/authorize)
    ↓ (no existing session detected)
Your Login Page (/prihlasenie)
    ↓ (user logs in)
Your OAuth Endpoint (/oauth/authorize) [auto-redirect after login]
    ↓ (now has valid session)
AWS Cognito OAuth
    ↓ (authorizes)
Partner Redirect URI (with authorization code)
```

**User Experience:** User sees your branded login page, logs in once, and is redirected to complete the OAuth flow.

## Architecture

### Session Detection

The OAuth service checks for existing user sessions by:

1. **Reading Amplify cookies** from the request
2. **Validating the access token** against Cognito's UserInfo endpoint
3. **Automatically continuing** if valid, or **redirecting to login** if not

```typescript
// Automatic SSO check in authorize endpoint
const hasValidSession = await this.oauthService.hasValidSession(req)

if (hasValidSession) {
  // User is logged in - continue to Cognito
  const authorizeUrl = this.oauthService.buildAuthorizeUrl(...)
  res.redirect(authorizeUrl)
} else {
  // User is not logged in - redirect to login page
  const loginUrl = this.oauthService.buildLoginRedirectUrl(...)
  res.redirect(loginUrl)
}
```

### Cookie-Based Authentication

Your Next.js application uses AWS Amplify, which stores authentication tokens in cookies with the pattern:
```
CognitoIdentityServiceProvider.{clientId}.{username}.accessToken
```

The OAuth service reads these cookies to determine if a user has an active session.

## OAuth Endpoints

### Authorization Endpoint
```
GET /oauth/authorize
```

**SSO Behavior:**
- ✅ If user is logged in → Redirects to Cognito (SSO)
- ❌ If user is not logged in → Redirects to `/prihlasenie` with return URL

**Parameters:**
- `response_type`: `code` or `token`
- `client_id`: Partner's client ID (e.g., `dpb-client-id`)
- `redirect_uri`: Partner's callback URL
- `scope`: Optional (default: `openid profile email`)
- `state`: Optional CSRF protection
- `code_challenge`: Optional PKCE challenge
- `code_challenge_method`: Optional (`S256` or `plain`)
- `nonce`: Optional

**Example:**
```
https://nest-city-account.bratislava.sk/oauth/authorize
  ?response_type=code
  &client_id=dpb-client-id
  &redirect_uri=https://dpb.example.com/callback
  &scope=openid+profile+email
  &state=random-state-123
```

### Token Endpoint
```
POST /oauth/token
```

Exchange authorization code for tokens.

**Authentication:** HTTP Basic Auth or body parameters (`client_id` + `client_secret`)

**Body Parameters:**
- `grant_type`: `authorization_code` | `refresh_token` | `client_credentials`
- `code`: Authorization code (for `authorization_code` grant)
- `redirect_uri`: Same URI used in authorization (for `authorization_code` grant)
- `refresh_token`: Refresh token (for `refresh_token` grant)
- `code_verifier`: PKCE verifier (if PKCE was used)

**Response:**
```json
{
  "access_token": "eyJraWQiOiJxxx...",
  "id_token": "eyJraWQiOiJxxx...",
  "refresh_token": "eyJjdHkiOiJKV1QiLxxx...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### UserInfo Endpoint
```
GET /oauth/userinfo
Authorization: Bearer {access_token}
```

Get user profile information.

**Response:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "email_verified": true,
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe"
}
```

### Logout Endpoint
```
GET /oauth/logout
```

**Parameters:**
- `client_id`: Optional partner client ID
- `logout_uri`: Optional redirect URI after logout
- `state`: Optional state parameter

**Behavior:**
1. Logs out from Cognito
2. Clears all sessions
3. Redirects to `logout_uri` or default login page

**Example:**
```
https://nest-city-account.bratislava.sk/oauth/logout
  ?client_id=dpb-client-id
  &logout_uri=https://dpb.example.com/logged-out
  &state=xyz
```

### Discovery Endpoints

**OpenID Configuration:**
```
GET /oauth/.well-known/openid-configuration
```

**JWKS (JSON Web Key Set):**
```
GET /oauth/.well-known/jwks.json
```

## Partner Integration Example

### Step 1: Authorization Request

Partner redirects user to:
```
https://nest-city-account.bratislava.sk/oauth/authorize
  ?response_type=code
  &client_id=dpb-client-id
  &redirect_uri=https://dpb.example.com/callback
  &scope=openid+profile+email
  &state=abc123
```

### Step 2: User Experience

**Scenario A: User already logged in**
- OAuth detects existing session
- Redirects directly to Cognito
- Cognito authorizes automatically
- User redirected back to partner with code
- **Total time: < 2 seconds, no user interaction needed**

**Scenario B: User not logged in**
- OAuth redirects to `/prihlasenie?redirect=/oauth/authorize?...`
- User logs in on your branded page
- After login, automatically continues OAuth flow
- User redirected back to partner with code

### Step 3: Token Exchange

Partner exchanges code for tokens:
```bash
curl -X POST https://nest-city-account.bratislava.sk/oauth/token \
  -H "Authorization: Basic base64(client_id:client_secret)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://dpb.example.com/callback"
```

### Step 4: Get User Info

Partner retrieves user information:
```bash
curl -X GET https://nest-city-account.bratislava.sk/oauth/userinfo \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Configuration

### Environment Variables

```bash
# Base URL for OAuth endpoints
OAUTH_BASE_URL='https://nest-city-account.bratislava.sk'

# Login page URL (for unauthenticated users)
OAUTH_LOGIN_PAGE_URL='/prihlasenie'

# Optional: Custom Cognito domain
OAUTH_COGNITO_DOMAIN='https://your-domain.auth.eu-central-1.amazoncognito.com'

# Partner configurations
OAUTH_DPB_CLIENT_ID='dpb-client-id'
OAUTH_DPB_CLIENT_SECRET='dpb-secret-with-us'
OAUTH_DPB_COGNITO_SECRET='dpb-cognito-secret'
OAUTH_DPB_REDIRECT_URIS='https://dpb.example.com/callback,https://dpb.example.com/other'

OAUTH_MPA_CLIENT_ID='mpa-client-id'
OAUTH_MPA_CLIENT_SECRET='mpa-secret-with-us'
OAUTH_MPA_COGNITO_SECRET='mpa-cognito-secret'
OAUTH_MPA_REDIRECT_URIS='https://mpa.example.com/callback'
```

### Cognito Setup

For each partner, register them in Cognito with:

1. **App Client:** Same `client_id` as in your OAuth config
2. **Callback URLs:** Match the `OAUTH_*_REDIRECT_URIS`
3. **OAuth Flows:** Authorization code grant, refresh token
4. **OAuth Scopes:** `openid`, `profile`, `email`

## Security Features

1. **Client Authentication:** Partners must authenticate with `client_id` + `client_secret`
2. **Redirect URI Validation:** Only whitelisted URIs are allowed per partner
3. **PKCE Support:** Enhanced security for public clients
4. **State Parameter:** CSRF protection
5. **Token Validation:** Access tokens validated before SSO
6. **Cognito as Issuer:** All tokens issued by AWS Cognito (no custom token minting)

## Logout Flow

When a partner wants to log out a user:

```
Partner → /oauth/logout?client_id=dpb-client-id&logout_uri=https://dpb.example.com/goodbye
         ↓
    Cognito Logout (clears all sessions)
         ↓
    Redirect to logout_uri
```

**Note:** Logout from Cognito logs the user out from **all** partner applications using the same Cognito user pool (SSO logout).

## Troubleshooting

### User stuck in redirect loop
- Check that `OAUTH_LOGIN_PAGE_URL` is correct
- Verify Amplify cookies are being set correctly
- Check browser console for cookie/CORS issues

### SSO not working
- Verify cookies are being sent with the request
- Check that access token is valid (not expired)
- Ensure Cognito client IDs match between partners and Cognito

### Invalid redirect URI error
- Verify URI is in `OAUTH_*_REDIRECT_URIS` environment variable
- Check for exact match (including protocol, host, port, path)
- Ensure Cognito app client has the same callback URLs registered

## Testing SSO

1. **Log into your Next.js app** at `/prihlasenie`
2. **Simulate partner redirect:**
   ```
   https://nest-city-account.bratislava.sk/oauth/authorize
     ?response_type=code
     &client_id=dpb-client-id
     &redirect_uri=https://dpb.example.com/callback
     &state=test123
   ```
3. **Expected:** Should immediately redirect to Cognito and back to partner, no login prompt
4. **Logout test:** Use `/oauth/logout` and verify complete logout

## Benefits of This Approach

✅ **Seamless UX:** Users logged into your app don't need to log in again for partners  
✅ **Branded Experience:** Login page uses your design, not Cognito hosted UI  
✅ **No Token Minting:** Cognito handles all token issuance and validation  
✅ **Fully Compliant:** Implements OAuth 2.0 and OpenID Connect specifications  
✅ **Secure:** Partner credentials separate from user credentials  
✅ **Scalable:** Easy to add more partners by adding environment variables  
✅ **Unified Sessions:** One login = access to your app + all integrated partners  

## Next Steps

1. Configure partner credentials in environment variables
2. Register partners in Cognito with matching client IDs
3. Test SSO flow with existing logged-in users
4. Test first-time flow with logged-out users
5. Implement logout in partner applications
6. Monitor OAuth flows in application logs
