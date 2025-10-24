# OAuth Flow - Simplified!

## The Key Insight

**The login page already does everything we need via SSR (Server-Side Rendering)!**

No custom session-check endpoint needed. No state storage needed. Just redirect to login!

---

## Complete Flow

### Scenario 1: User Already Logged In (SSO)

```
1. Partner → nest-city-account.bratislava.sk/oauth/authorize
             ?client_id=dpb-client-id
             &redirect_uri=https://dpb.example.com/callback
             &response_type=code

2. Backend checks: access_token parameter? → NO
   Backend → konto.bratislava.sk/prihlasenie
             ?redirect=nest-city-account.bratislava.sk/oauth/authorize?client_id=...

3. Login page SSR (Server-Side):
   - Checks Amplify session cookies
   - User IS logged in! ✅
   - Calls getRedirectUrl() which:
     * Fetches user's access_token
     * Adds it to redirect URL
   
   SSR Redirect → nest-city-account.bratislava.sk/oauth/authorize
                  ?client_id=dpb-client-id
                  &redirect_uri=https://dpb.example.com/callback
                  &response_type=code
                  &access_token=eyJraWQiOiJxxx...    ← Auto-added!

4. Backend checks: access_token parameter? → YES! ✅
   Backend → Cognito OAuth
             ?client_id=dpb-client-id
             &redirect_uri=https://dpb.example.com/callback
             &response_type=code

5. Cognito sees existing session (from access_token) → Auto-approves (SSO)

6. Cognito → Partner callback
            ?code=AUTH_CODE&state=...

Total time: ~2 seconds, user sees nothing! 🎉
```

### Scenario 2: User Not Logged In

```
1. Partner → nest-city-account.bratislava.sk/oauth/authorize
             ?client_id=dpb-client-id
             &redirect_uri=https://dpb.example.com/callback
             &response_type=code

2. Backend checks: access_token parameter? → NO
   Backend → konto.bratislava.sk/prihlasenie
             ?redirect=nest-city-account.bratislava.sk/oauth/authorize?client_id=...

3. Login page SSR (Server-Side):
   - Checks Amplify session cookies
   - User NOT logged in ✗
   - Renders login form

4. User sees login form, enters credentials, clicks submit

5. LoginPage component:
   - Calls signIn() → Success! ✅
   - Calls redirect() which:
     * Reads redirect parameter
     * Checks: Is URL approved? (NEXT_PUBLIC_AUTH_APPROVED_ORIGINS)
     * Fetches user's fresh access_token
     * Adds it to redirect URL
   
   Client-side redirect → nest-city-account.bratislava.sk/oauth/authorize
                          ?client_id=dpb-client-id
                          &redirect_uri=https://dpb.example.com/callback
                          &response_type=code
                          &access_token=eyJraWQiOiJxxx...    ← Auto-added!

6. (Same as steps 4-6 from Scenario 1)
```

### Scenario 3: User Chooses to Register Instead

```
1-3. (Same as Scenario 2)

4. User clicks "Create account" link
   → Redirected to: /registracia?redirect=nest-city-account.bratislava.sk/oauth/authorize?...
   
   (Redirect parameter is preserved!)

5. Registration page SSR:
   - Also has requiresSignOut: true, redirectQueryParam: true
   - If user somehow already logged in → auto-redirect with access_token
   - Otherwise → show registration form

6. User completes registration:
   - Email verification
   - Auto sign-in OR manual sign-in
   - Calls redirect() which:
     * Same logic as login page
     * Fetches access_token
     * Adds to redirect URL

7. User → nest-city-account.bratislava.sk/oauth/authorize?...&access_token=xxx

8. (Continues as SSO flow)
```

---

## The Magic Code (Already There!)

### In Login/Registration Pages

**`amplifyGetServerSideProps` with these options:**
```typescript
{ requiresSignOut: true, redirectQueryParam: true }
```

**What this does (from `amplifyServer.ts` lines 99-111):**

```typescript
const shouldRedirectNotSignedOut = options?.requiresSignOut && isSignedIn

if (shouldRedirectNotSignedOut) {
  if (options?.redirectQueryParam) {
    const safeRedirect = getSafeRedirect(context.query[redirectQueryParam])
    const destination = await getRedirectUrl(safeRedirect, fetchAuthSessionFn)
    // ↑ This adds access_token for remote URLs!
    
    return { redirect: { destination, permanent: false } }
  }
}
```

**Translation:**
- If user IS logged in AND page requires sign-out
- AND redirect parameter is set
- Get the safe redirect URL
- Add access_token to it
- Auto-redirect (SSR - before page even loads!)

### In `getRedirectUrl()` Function

**From `queryParamRedirect.ts` lines 106-121:**

```typescript
if (safeRedirect.type === SafeRedirectType.Remote) {
  const parsedUrl = new URL(safeRedirect.url)
  const authSession = await fetchAuthSession()
  const accessToken = authSession.tokens?.accessToken.toString()
  if (accessToken) {
    parsedUrl.searchParams.set('access_token', accessToken)  // ← THE MAGIC!
  }
  return parsedUrl.toString()
}
```

**Translation:**
- For remote URLs (like backend)
- Fetch current Cognito session
- Get access_token
- Add it to URL
- Return complete URL with token

---

## Configuration Required

### 1. Frontend (.env)

```bash
# CRITICAL: Add backend URL to approved origins!
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk,https://nest-forms-backend.bratislava.sk,https://nest-tax-backend.bratislava.sk

# Backend URL for validation
NEXT_PUBLIC_NEST_CITY_ACCOUNT_URL=https://nest-city-account.bratislava.sk
```

**Why needed:**
- `getSafeRedirect()` checks if redirect URL is in approved origins
- Without this: Redirect blocked, user sent to home page
- With this: Redirect allowed, access_token added

### 2. Backend (.env)

```bash
OAUTH_BASE_URL=https://nest-city-account.bratislava.sk
OAUTH_FRONTEND_URL=https://konto.bratislava.sk
OAUTH_FRONTEND_LOGIN_URL=https://konto.bratislava.sk/prihlasenie

# Partner configs...
OAUTH_DPB_CLIENT_ID=dpb-client-id
OAUTH_DPB_CLIENT_SECRET=dpb-client-secret
OAUTH_DPB_COGNITO_SECRET=dpb-cognito-secret
OAUTH_DPB_REDIRECT_URIS=https://dpb.example.com/callback
```

---

## What Was Simplified

### ❌ Before (Overcomplicated):
- Created `/api/session-check` endpoint
- Backend stored OAuth state temporarily
- Two-step flow: authorize → continue
- Extra redirects

### ✅ Now (Simple):
- No custom endpoints needed
- No state storage needed
- Single `/oauth/authorize` endpoint
- Uses existing login page logic

---

## Implementation

### Backend OAuth Controller

```typescript
@Get('authorize')
async authorize(
  @Query() authorizeDto: AuthorizeRequestDto,
  @Query('access_token') accessToken: string,
  @Req() req: RequestWithPartner,
  @Res() res: Response
): Promise<void> {
  if (accessToken) {
    // User authenticated - redirect to Cognito
    const authorizeUrl = this.oauthService.buildCognitoAuthorizeUrl(
      authorizeDto,
      req.partner,
      accessToken
    )
    res.redirect(authorizeUrl)
  } else {
    // No access_token - redirect to login
    // Login page handles session detection automatically
    const loginUrl = this.oauthService.buildLoginRedirectUrl(authorizeDto, req.partner)
    res.redirect(loginUrl)
  }
}
```

**That's it!** Single endpoint, simple logic.

### Backend OAuth Service

```typescript
buildLoginRedirectUrl(
  authorizeParams: AuthorizeRequestDto,
  partner: PartnerConfig
): string {
  // Build return URL with all OAuth parameters
  const returnParams = new URLSearchParams({
    response_type: authorizeParams.response_type,
    client_id: authorizeParams.client_id,
    redirect_uri: authorizeParams.redirect_uri,
    // ... all other params
  })
  
  const returnUrl = `${baseUrl}/oauth/authorize?${returnParams.toString()}`
  
  // Redirect to login with return URL
  return `${frontendLoginUrl}?redirect=${encodeURIComponent(returnUrl)}`
}
```

**That's it!** No state storage, just build redirect URL.

---

## Frontend Changes

### Files Modified

**Modified:**
- `pages/odhlasenie.tsx` - Detect `oauth_logout=true`, redirect to oauth handler

**Created:**
- `pages/odhlasenie-oauth.tsx` - Handle OAuth logout

**Unchanged:**
- `pages/prihlasenie.tsx` - Already perfect! ✅
- `pages/registracia.tsx` - Already perfect! ✅

### Environment Variables

```bash
# Add this line to existing .env:
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk,...
```

---

## Testing

### Test SSO (User Logged In)

```bash
# 1. Login first
open https://konto.bratislava.sk/prihlasenie
# (Login with credentials)

# 2. Trigger OAuth
open "https://nest-city-account.bratislava.sk/oauth/authorize?response_type=code&client_id=dpb-client-id&redirect_uri=https://dpb.example.com/callback&state=test"

# Expected:
# → Redirect to /prihlasenie?redirect=...
# → SSR detects user logged in
# → Auto-redirect to /oauth/authorize?...&access_token=xxx
# → Backend redirects to Cognito
# → Cognito auto-approves (SSO)
# → Partner gets auth code
# Total time: ~2 seconds, no login form shown!
```

### Test Login Flow (User Not Logged In)

```bash
# 1. Logout
open https://konto.bratislava.sk/odhlasenie

# 2. Trigger OAuth (same URL as above)

# Expected:
# → Redirect to /prihlasenie?redirect=...
# → SSR detects user NOT logged in
# → Shows login form
# → User enters credentials
# → After login, redirect() adds access_token
# → Continues as SSO flow
```

### Test Registration Flow

```bash
# 1. From login page, click "Create account"
# 2. Complete registration
# 3. After registration success, should auto-redirect to OAuth flow
```

---

## Why This Is Better

✅ **Simpler** - No custom endpoints, no state storage  
✅ **Leverages existing code** - Login page already has all the logic  
✅ **SSO works** - Users logged in get auto-redirected  
✅ **Registration works** - Redirect parameter preserved  
✅ **Secure** - Approved origins validation built-in  
✅ **Maintainable** - Less code, less complexity  

---

## Summary

**The login page is perfect as-is!** It already:
- Detects logged-in users (SSR)
- Auto-redirects with access_token
- Preserves redirect parameters
- Works with registration flow

All you need:
1. ✅ Add `NEXT_PUBLIC_AUTH_APPROVED_ORIGINS` to frontend
2. ✅ Backend redirects to `/prihlasenie?redirect=...`
3. ✅ Login page handles the rest automatically

**No custom session-check endpoint. No state storage. Just works!** 🎉
