# OAuth Implementation - Backend-Driven with Frontend Session Relay

## Architecture Overview

### Core Principle
**Backend owns ALL OAuth logic and secrets. Frontend is ONLY a session checker and relay.**

```
┌──────────────────────────────────────────────────────────────────┐
│  Backend (nest-city-account.bratislava.sk)                       │
│  - Owns ALL OAuth secrets                                        │
│  - Handles ALL OAuth logic                                       │
│  - Validates partners                                            │
│  - Manages token exchange                                        │
└──────────────────────────────────────────────────────────────────┘
                              ↕
        (Only for session checking - NO secrets)
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│  Frontend (konto.bratislava.sk)                                  │
│  - Checks if user is logged in                                   │
│  - Returns session token to backend                              │
│  - Handles login/logout UI                                       │
│  - NO OAuth secrets or logic                                     │
└──────────────────────────────────────────────────────────────────┘
```

## The Flow

### 1. Authorization Request (SSO Enabled)

```
Partner (DPB)
    ↓
    Redirects to: nest-city-account.bratislava.sk/oauth/authorize
                  ?client_id=dpb-client-id
                  &redirect_uri=https://dpb.example.com/callback
                  &response_type=code
                  &state=xyz
    ↓
Backend (nest-city-account)
    - Validates client_id (DPB partner)
    - Stores OAuth parameters temporarily (stateId: abc123)
    - Redirects to frontend for session check
    ↓
    Redirects to: konto.bratislava.sk/api/session-check
                  ?return_url=nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123
    ↓
Frontend (konto.bratislava.sk)
    - Checks Amplify cookies
    - Is user logged in?
    ↓
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    ▼ YES (User logged in)          ▼ NO (Not logged in)
    
    Redirects to:                   Redirects to:
    nest-city-account/              nest-city-account/
    oauth/authorize/continue        oauth/authorize/continue
    ?state=abc123                   ?state=abc123
    &access_token=eyJxxx...         (no access_token)
    ↓                               ↓
Backend receives access token      Backend receives NO token
    ↓                               ↓
    SSO: Redirects to Cognito       Redirects to login page:
    (auto-approves)                 konto.bratislava.sk/prihlasenie
    ↓                               ?redirect=...
    Cognito authorizes              ↓
    ↓                               User logs in
    Partner callback                ↓
    with auth code                  Redirects back to OAuth flow
                                    ↓
                                    Continues as SSO flow →
```

### 2. Token Exchange (No Frontend Involvement)

```
Partner (DPB)
    ↓
    POST nest-city-account.bratislava.sk/oauth/token
    Authorization: Basic base64(client_id:client_secret)
    Body: grant_type=authorization_code&code=xxx&redirect_uri=...
    ↓
Backend (nest-city-account)
    - Validates client credentials
    - Exchanges code with Cognito using partner's Cognito secret
    - Returns tokens to partner
    ↓
Partner receives:
    {
      "access_token": "...",
      "id_token": "...",
      "refresh_token": "...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
```

### 3. Logout Flow

```
Partner (DPB)
    ↓
    Redirects to: nest-city-account.bratislava.sk/oauth/logout
                  ?client_id=dpb-client-id
                  &logout_uri=https://dpb.example.com/goodbye
                  &state=xyz
    ↓
Backend (nest-city-account)
    - Validates logout_uri is allowed for this client
    - Redirects to frontend logout
    ↓
    Redirects to: konto.bratislava.sk/odhlasenie
                  ?oauth_logout=true
                  &logout_uri=https://dpb.example.com/goodbye
                  &state=xyz
    ↓
Frontend (konto.bratislava.sk)
    - Detects oauth_logout=true
    - Redirects to: /odhlasenie-oauth
    ↓
    Signs out from Amplify/Cognito
    ↓
    Redirects to: https://dpb.example.com/goodbye?state=xyz
```

## Files Created/Modified

### Backend (nest-city-account)

#### Modified Files:
```
src/oauth/
├── oauth.service.ts          # Updated to use frontend session relay
│   - Removed cookie checking
│   - Added OAuth state storage
│   - Added session check URL building
│   - Added login redirect URL building
│
└── oauth.controller.ts       # Updated authorization flow
    - /oauth/authorize        → Stores state, redirects to FE
    - /oauth/authorize/continue → Receives session token, continues flow
    - /oauth/logout           → Redirects to FE logout
    - /oauth/token            → (Unchanged) Token exchange
    - /oauth/userinfo         → (Unchanged) User info
```

#### Configuration:
```
.env.example
├── OAUTH_BASE_URL           # This backend URL
├── OAUTH_FRONTEND_URL       # Frontend URL for session check
├── OAUTH_FRONTEND_LOGIN_URL # Frontend login page
├── Partner configs...       # (Unchanged)
```

### Frontend (Next.js)

#### Created Files:
```
pages/api/
└── session-check.ts          # Session checker endpoint
    - Checks Amplify cookies
    - Returns session token if logged in
    - Redirects back to backend

pages/
└── odhlasenie-oauth.tsx      # OAuth logout handler
    - Signs out from Amplify
    - Redirects to logout_uri
```

#### Modified Files:
```
pages/odhlasenie.tsx          # Updated to handle OAuth logout
    - Detects oauth_logout=true
    - Redirects to odhlasenie-oauth
```

#### Configuration:
```
.env.example
└── NEXT_PUBLIC_NEST_CITY_ACCOUNT_URL  # Backend URL (for validation)
    # NO OAuth secrets!
```

## Environment Variables

### Backend (nest-city-account)

```bash
# OAuth Configuration
OAUTH_BASE_URL=https://nest-city-account.bratislava.sk
OAUTH_FRONTEND_URL=https://konto.bratislava.sk
OAUTH_FRONTEND_LOGIN_URL=https://konto.bratislava.sk/prihlasenie

# AWS Cognito
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_USERPOOL_ID=your-user-pool-id

# DPB Partner
OAUTH_DPB_CLIENT_ID=dpb-client-id
OAUTH_DPB_CLIENT_SECRET=dpb-client-secret           # Shared with DPB
OAUTH_DPB_COGNITO_SECRET=dpb-cognito-secret         # Backend-to-Cognito
OAUTH_DPB_REDIRECT_URIS=https://dpb.example.com/callback

# MPA Partner
OAUTH_MPA_CLIENT_ID=mpa-client-id
OAUTH_MPA_CLIENT_SECRET=mpa-client-secret
OAUTH_MPA_COGNITO_SECRET=mpa-cognito-secret
OAUTH_MPA_REDIRECT_URIS=https://mpa.example.com/callback
```

### Frontend (Next.js)

```bash
# Backend URL (for validation only - NO secrets!)
NEXT_PUBLIC_NEST_CITY_ACCOUNT_URL=https://nest-city-account.bratislava.sk

# Auth Approved Origins - IMPORTANT! Must include backend URL for OAuth redirects
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk,https://nest-forms-backend.bratislava.sk,https://nest-tax-backend.bratislava.sk

# AWS Cognito (already exists)
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_USERPOOL_ID=your-user-pool-id
```

## Partner Integration URLs

Partners use these URLs (all on backend):

```
Authorization: https://nest-city-account.bratislava.sk/oauth/authorize
Token:         https://nest-city-account.bratislava.sk/oauth/token
UserInfo:      https://nest-city-account.bratislava.sk/oauth/userinfo
Logout:        https://nest-city-account.bratislava.sk/oauth/logout
Discovery:     https://nest-city-account.bratislava.sk/oauth/.well-known/openid-configuration
JWKS:          https://nest-city-account.bratislava.sk/oauth/.well-known/jwks.json
```

## Security Features

### ✅ No Secrets in Frontend
- Frontend has ZERO OAuth secrets
- Only backend can authenticate partners
- Only backend can exchange tokens with Cognito

### ✅ Secure Session Token Relay
- Frontend returns temporary session token
- Token is Cognito access token (short-lived)
- Only used once to enable SSO
- Validated return URL (must be from backend)

### ✅ OAuth State Management
- Temporary state storage (5 minutes TTL)
- Prevents replay attacks
- Auto-cleanup of expired states

### ✅ Partner Validation
- Client credentials validated by backend
- Redirect URI whitelist per partner
- No partner info exposed to frontend

## Key Advantages

✅ **Security**: All secrets stay on backend  
✅ **Simplicity**: Frontend has minimal OAuth code  
✅ **SSO**: Users stay logged in across partners  
✅ **Separation**: Clear frontend/backend boundaries  
✅ **Standards**: Full OAuth 2.0 + OIDC compliance  
✅ **Maintainable**: OAuth logic in one place (backend)  

## Testing

### 1. Test SSO Flow

```bash
# Step 1: Log into frontend
Visit: https://konto.bratislava.sk/prihlasenie
Login with credentials

# Step 2: Trigger OAuth flow
Visit: https://nest-city-account.bratislava.sk/oauth/authorize
       ?response_type=code
       &client_id=dpb-client-id
       &redirect_uri=https://dpb.example.com/callback
       &state=test123

# Expected:
# - Redirects to konto.bratislava.sk/api/session-check
# - Frontend checks session (logged in ✓)
# - Redirects back to nest-city-account/oauth/authorize/continue with session_token
# - Backend redirects to Cognito
# - Cognito auto-approves (SSO)
# - Redirects to DPB callback with code
```

### 2. Test Unauthenticated Flow

```bash
# Step 1: Logout
Visit: https://konto.bratislava.sk/odhlasenie

# Step 2: Trigger OAuth flow (same as above)

# Expected:
# - Redirects to konto.bratislava.sk/api/session-check
# - Frontend checks session (NOT logged in ✗)
# - Redirects back to nest-city-account/oauth/authorize/continue WITHOUT session_token
# - Backend redirects to konto.bratislava.sk/prihlasenie
# - User logs in
# - After login, redirects back to OAuth flow
# - Continues as SSO flow
```

### 3. Test Logout

```bash
Visit: https://nest-city-account.bratislava.sk/oauth/logout
       ?client_id=dpb-client-id
       &logout_uri=https://dpb.example.com/goodbye
       &state=xyz

# Expected:
# - Redirects to konto.bratislava.sk/odhlasenie?oauth_logout=true&...
# - Frontend redirects to /odhlasenie-oauth
# - Signs out from Amplify
# - Redirects to https://dpb.example.com/goodbye?state=xyz
```

## State Storage (Production Considerations)

Currently, OAuth state is stored in-memory. For production:

### Option 1: Redis
```typescript
// In oauth.service.ts
private readonly redis = new Redis(process.env.REDIS_URL)

async storeOAuthState(stateId: string, data: any): Promise<void> {
  await this.redis.setex(`oauth:state:${stateId}`, 300, JSON.stringify(data))
}

async getAndRemoveOAuthState(stateId: string): Promise<any> {
  const data = await this.redis.get(`oauth:state:${stateId}`)
  await this.redis.del(`oauth:state:${stateId}`)
  return data ? JSON.parse(data) : null
}
```

### Option 2: Database
```typescript
// Create OAuth state table
await prisma.oAuthState.create({
  data: {
    stateId,
    data: JSON.stringify(oauthState),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  },
})
```

## Troubleshooting

### Issue: Session token not being passed
**Check:**
- Is user actually logged in at konto.bratislava.sk?
- Check browser cookies for `CognitoIdentityServiceProvider.*`
- Check frontend logs for `[Session Check]` messages

### Issue: Invalid or expired OAuth state
**Check:**
- OAuth flow must complete within 5 minutes
- Each state can only be used once
- Check backend logs for state storage/retrieval

### Issue: Redirect loop
**Check:**
- Is `OAUTH_FRONTEND_URL` correct?
- Is `NEXT_PUBLIC_NEST_CITY_ACCOUNT_URL` correct?
- Are return URLs being validated properly?

### Issue: Logout not working
**Check:**
- Is `oauth_logout=true` being passed?
- Check `/odhlasenie.tsx` SSR redirect logic
- Verify `/odhlasenie-oauth.tsx` is receiving parameters

## Summary

This implementation:
- ✅ Keeps ALL OAuth secrets in backend
- ✅ Frontend only checks sessions and relays
- ✅ Enables SSO for logged-in users
- ✅ Redirects to login for unauthenticated users
- ✅ Handles logout properly
- ✅ Fully OAuth 2.0 / OIDC compliant
- ✅ Secure and maintainable

**Backend owns the OAuth logic. Frontend is just a helpful session checker.** 🎯
