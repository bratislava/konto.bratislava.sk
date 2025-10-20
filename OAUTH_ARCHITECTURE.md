# OAuth Architecture - Cross-Domain SSO Solution

## The Cookie Domain Challenge

### Problem
Your architecture has two separate domains:
- **Frontend (Next.js)**: `konto.bratislava.sk` - where users log in
- **Backend (Nest.js)**: `nest-city-account.bratislava.sk` - where business logic runs

**Cookie Issue:** Amplify sets authentication cookies on `konto.bratislava.sk`. When partners redirect to `nest-city-account.bratislava.sk/oauth/authorize`, those cookies are **not sent** because browsers don't share cookies across different subdomains.

```
User logs in at: konto.bratislava.sk
                      ↓
            Cookies stored: domain=konto.bratislava.sk
                      ↓
Partner redirects to: nest-city-account.bratislava.sk/oauth/authorize
                      ↓
            ❌ Cookies NOT sent (different subdomain)
                      ↓
            Backend can't detect if user is logged in
```

## Solution Architecture

### Two-Tier OAuth Implementation

We split OAuth endpoints between frontend (Next.js) and backend (Nest.js):

**Frontend (konto.bratislava.sk) - Has access to Amplify cookies:**
- ✅ `/api/oauth/authorize` - Authorization endpoint (SSO-enabled)
- ✅ `/api/oauth/logout` - Logout endpoint
- ✅ `/api/oauth/.well-known/openid-configuration` - Discovery document
- ✅ `/api/oauth/.well-known/jwks.json` - Public keys

**Backend (nest-city-account.bratislava.sk) - No cookie access needed:**
- ✅ `/oauth/token` - Token exchange (uses client credentials)
- ✅ `/oauth/userinfo` - User information (uses access token)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Partner (DPB/MPA)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1. Redirect to authorization
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: konto.bratislava.sk/api/oauth/authorize             │
│  - Has access to Amplify cookies ✓                             │
│  - Checks if user is authenticated                              │
└────────────┬───────────────────────────────────────────────┬────┘
             │                                               │
        ┌────┴─────┐                                    ┌────┴─────┐
        │ Logged   │                                    │ Not      │
        │ in? ✓    │                                    │ logged   │
        └────┬─────┘                                    │ in ✗     │
             │                                          └────┬─────┘
             │                                               │
             │                                               │
             ▼                                               ▼
    ┌────────────────┐                            ┌──────────────────┐
    │ Cognito OAuth  │                            │ /prihlasenie     │
    │ (auto SSO)     │                            │ (user logs in)   │
    └────────┬───────┘                            └────────┬─────────┘
             │                                              │
             │                                              │
             │                                              ▼
             │                                   Back to /api/oauth/authorize
             │                                              │
             └──────────────────┬───────────────────────────┘
                                │
                                ▼
                        ┌────────────────┐
                        │ Cognito OAuth  │
                        │ returns code   │
                        └────────┬───────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ Partner        │
                        │ callback       │
                        └────────┬───────┘
                                 │
                                 │ 2. Exchange code for token
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: konto.bratislava.sk/api/oauth/token                 │
│  - Proxies to backend (no cookies needed)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 3. Forward with client credentials
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: nest-city-account.bratislava.sk/oauth/token          │
│  - Validates client credentials                                 │
│  - Exchanges code with Cognito using partner's secret           │
│  - Returns tokens                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │ Partner │
                    └─────────┘
```

## Implementation Details

### Frontend (Next.js) API Routes

#### 1. Authorization Endpoint
**File:** `/pages/api/oauth/authorize.ts`

```typescript
// Has access to Amplify cookies via baRunWithAmplifyServerContext
const isAuthenticated = await baRunWithAmplifyServerContext({
  nextServerContext: { request: req, response: res },
  operation: async (contextSpec) => {
    const session = await fetchAuthSession(contextSpec)
    return Boolean(session.tokens)
  },
})

if (isAuthenticated) {
  // SSO: Redirect to Cognito
  res.redirect(cognitoAuthorizeUrl)
} else {
  // Not logged in: Redirect to login
  res.redirect(`/prihlasenie?redirect=${currentUrl}`)
}
```

**Key Points:**
- ✅ Runs on `konto.bratislava.sk` → has cookie access
- ✅ Uses Amplify's server-side session detection
- ✅ Enables true SSO without re-authentication

#### 2. Token Endpoint (Proxy)
**File:** `/pages/api/oauth/token.ts`

```typescript
// Simply forwards to backend
const response = await fetch(`${backendUrl}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: authHeader, // Client credentials
  },
  body: requestBody,
})
```

**Key Points:**
- ✅ No cookies needed (uses client credentials)
- ✅ Proxies to Nest backend for actual logic

#### 3. Logout Endpoint
**File:** `/pages/api/oauth/logout.ts`

```typescript
// Signs out from Amplify
await signOut(contextSpec)
// Redirects to partner's logout URI or home
res.redirect(logoutUri)
```

**Key Points:**
- ✅ Has access to clear Amplify session
- ✅ Validates redirect URIs for security

### Backend (Nest.js) OAuth Module

#### Token Endpoint (Unchanged)
**Purpose:** Exchange authorization code for tokens using Cognito

**Why it works without cookies:**
- Uses **client credentials** (Basic Auth) for authentication
- Uses **authorization code** from URL parameter
- No need for user session cookies

#### UserInfo Endpoint (Unchanged)
**Purpose:** Get user information using access token

**Why it works without cookies:**
- Uses **Bearer token** from Authorization header
- Token is validated against Cognito

## URL Structure

### Partner Integration URLs

Partners should use these URLs (all on `konto.bratislava.sk`):

```
Authorization:  https://konto.bratislava.sk/api/oauth/authorize
Token:          https://konto.bratislava.sk/api/oauth/token
UserInfo:       https://konto.bratislava.sk/api/oauth/userinfo
Logout:         https://konto.bratislava.sk/api/oauth/logout
OIDC Config:    https://konto.bratislava.sk/api/oauth/.well-known/openid-configuration
JWKS:           https://konto.bratislava.sk/api/oauth/.well-known/jwks.json
```

### Backend URLs (Internal)

These are called by the Next.js frontend (not directly by partners):

```
Token:    https://nest-city-account.bratislava.sk/oauth/token
UserInfo: https://nest-city-account.bratislava.sk/oauth/userinfo
```

## Configuration

### Next.js Environment Variables

```bash
# Base URL for OAuth endpoints (your frontend)
OAUTH_BASE_URL=https://konto.bratislava.sk

# Backend URL for proxying requests
NEST_CITY_ACCOUNT_URL=https://nest-city-account.bratislava.sk

# Cognito configuration
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_USERPOOL_ID=your-user-pool-id

# Partner configurations (shared with backend)
OAUTH_DPB_CLIENT_ID=dpb-client-id
OAUTH_DPB_CLIENT_SECRET=dpb-secret
OAUTH_DPB_REDIRECT_URIS=https://dpb.example.com/callback

OAUTH_MPA_CLIENT_ID=mpa-client-id
OAUTH_MPA_CLIENT_SECRET=mpa-secret
OAUTH_MPA_REDIRECT_URIS=https://mpa.example.com/callback
```

### Nest.js Environment Variables

```bash
# Cognito configuration
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_USERPOOL_ID=your-user-pool-id

# Partner configurations (same as frontend)
OAUTH_DPB_CLIENT_ID=dpb-client-id
OAUTH_DPB_CLIENT_SECRET=dpb-secret
OAUTH_DPB_COGNITO_SECRET=dpb-cognito-secret  # Different! Used to call Cognito
OAUTH_DPB_REDIRECT_URIS=https://dpb.example.com/callback

OAUTH_MPA_CLIENT_ID=mpa-client-id
OAUTH_MPA_CLIENT_SECRET=mpa-secret
OAUTH_MPA_COGNITO_SECRET=mpa-cognito-secret
OAUTH_MPA_REDIRECT_URIS=https://mpa.example.com/callback
```

## Security Considerations

### 1. Cookie Domain Isolation
✅ **Benefit:** Cookies stay isolated to `konto.bratislava.sk`
✅ **Security:** Backend doesn't need cookie access (principle of least privilege)

### 2. Client Credential Separation
✅ **Partner Secret:** Shared with partner for OAuth authentication
✅ **Cognito Secret:** Internal secret for backend-to-Cognito communication
✅ **Never exposed:** Cognito secret never leaves your infrastructure

### 3. Redirect URI Validation
✅ **Whitelisted URIs:** Each partner has allowed redirect URIs
✅ **Validated:** Both frontend and backend validate redirect URIs
✅ **Prevents:** Open redirect vulnerabilities

### 4. HTTPS Only
✅ **All communication:** Over HTTPS
✅ **Cookies:** Secure flag set by Amplify
✅ **Tokens:** Transmitted via HTTPS only

## Testing the SSO Flow

### Step 1: Log into your app
```
Visit: https://konto.bratislava.sk/prihlasenie
Log in with your credentials
```

### Step 2: Simulate partner redirect
```
Visit: https://konto.bratislava.sk/api/oauth/authorize
       ?response_type=code
       &client_id=dpb-client-id
       &redirect_uri=https://dpb.example.com/callback
       &state=test123
```

### Step 3: Observe SSO
✅ **Expected:** Immediately redirected to Cognito and back to partner
✅ **No login prompt** shown (SSO works!)

### Step 4: Test unauthenticated flow
```
1. Logout from your app
2. Repeat Step 2
3. Should redirect to /prihlasenie
4. After login, auto-continues OAuth flow
```

## Benefits of This Architecture

✅ **True SSO:** Users logged into `konto.bratislava.sk` don't re-authenticate  
✅ **Cookie Security:** Cookies isolated to frontend domain  
✅ **Separation of Concerns:** Frontend handles auth, backend handles tokens  
✅ **Standard OAuth:** Partners use standard OAuth 2.0 flow  
✅ **Scalable:** Easy to add more partners  
✅ **Maintainable:** Clear separation between frontend/backend logic  

## Troubleshooting

### SSO not working
**Check:**
1. ✅ Is user logged into `konto.bratislava.sk`?
2. ✅ Are Amplify cookies being set?
3. ✅ Is `fetchAuthSession` returning valid tokens?
4. ✅ Are you testing on the correct domain (`konto.bratislava.sk`)?

### Token exchange failing
**Check:**
1. ✅ Is `NEST_CITY_ACCOUNT_URL` correct in Next.js env?
2. ✅ Are client credentials matching in both frontend and backend?
3. ✅ Is Cognito client secret correct in backend?
4. ✅ Is the redirect URI whitelisted?

### Redirect loop
**Check:**
1. ✅ Is `OAUTH_BASE_URL` set to `https://konto.bratislava.sk`?
2. ✅ Is `/prihlasenie` handling the `redirect` query parameter?
3. ✅ Are there any CORS issues?

## Migration from Backend-Only OAuth

If you previously had OAuth endpoints only on `nest-city-account.bratislava.sk`:

1. ✅ Update partner redirect URLs from `nest-city-account.bratislava.sk` to `konto.bratislava.sk`
2. ✅ Update OpenID discovery document URLs
3. ✅ Keep backend endpoints for internal use (token, userinfo)
4. ✅ Test SSO flow thoroughly

## Next Steps

1. ✅ Configure environment variables in both projects
2. ✅ Deploy Next.js API routes to `konto.bratislava.sk`
3. ✅ Update partner documentation with new OAuth URLs
4. ✅ Test SSO with logged-in users
5. ✅ Test first-time flow with logged-out users
6. ✅ Monitor logs for any issues
