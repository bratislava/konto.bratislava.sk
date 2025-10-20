# OAuth Login Flow - How It Works

## The Login Page Already Works! ✅

Your existing `/prihlasenie` page already handles OAuth redirects correctly. Here's what happens:

## Flow Breakdown

### 1. User Clicks Partner Link (Not Logged In)

```
User at DPB → Clicks "Login with Bratislava"
    ↓
DPB redirects to:
    nest-city-account.bratislava.sk/oauth/authorize
    ?client_id=dpb-client-id
    &redirect_uri=https://dpb.example.com/callback
    &response_type=code
    &state=xyz
```

### 2. Backend Stores OAuth State & Checks Session

```
Backend (nest-city-account.bratislava.sk):
    ✅ Validates client_id (DPB partner)
    ✅ Stores OAuth params temporarily (stateId: abc123)
    ✅ Redirects to frontend for session check
    ↓
konto.bratislava.sk/api/session-check
    ?return_url=nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123
```

### 3. Frontend Checks Session (User NOT Logged In)

```
Frontend (konto.bratislava.sk/api/session-check):
    ❌ Checks Amplify cookies → No session found
    ↓
    Redirects back WITHOUT access_token:
    nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123
```

### 4. Backend Redirects to Login

```
Backend receives request WITHOUT access_token
    ↓
Backend redirects to:
    konto.bratislava.sk/prihlasenie
    ?redirect=nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123
```

### 5. User Logs In (The Magic Happens Here!)

```
User at konto.bratislava.sk/prihlasenie
    ↓
User enters email & password
    ↓
LoginPage component:
    - Calls signIn() with credentials
    - ✅ Login successful!
    - Calls await redirect() [Line 62 of prihlasenie.tsx]
    ↓
redirect() function (from useQueryParamRedirect hook):
    - Reads 'redirect' query parameter
    - URL is: nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123
    - Checks if URL is in NEXT_PUBLIC_AUTH_APPROVED_ORIGINS ← IMPORTANT!
    - ✅ URL is approved (backend is in the list)
    - Calls getRedirectUrl() which:
        * Fetches the user's access token
        * AUTOMATICALLY adds it to the URL
    ↓
    Redirects to:
    nest-city-account.bratislava.sk/oauth/authorize/continue
    ?state=abc123
    &access_token=eyJraWQiOiJxxx...    ← Automatically added!
```

### 6. Backend Receives Access Token & Continues OAuth

```
Backend (nest-city-account.bratislava.sk/oauth/authorize/continue):
    ✅ Receives state=abc123 & access_token=xxx
    ✅ Retrieves stored OAuth parameters
    ✅ User has access_token → SSO enabled!
    ↓
    Redirects to Cognito:
    cognito.amazonaws.com/oauth2/authorize
    ?client_id=dpb-client-id
    &redirect_uri=https://dpb.example.com/callback
    &response_type=code
    &state=xyz
    ↓
Cognito sees user already logged in (from access_token session)
    ↓
    Auto-approves (SSO) and redirects:
    https://dpb.example.com/callback?code=AUTH_CODE&state=xyz
```

## The Key: NEXT_PUBLIC_AUTH_APPROVED_ORIGINS

### Why It's Needed

The login page has a security feature that only allows redirects to:
1. **Local paths** (starting with `/`)
2. **Approved remote origins** (in `NEXT_PUBLIC_AUTH_APPROVED_ORIGINS`)

**From `queryParamRedirect.ts` (lines 44-51):**
```typescript
try {
  const url = new URL(queryParam)
  if (environment.authApprovedOrigins.includes(url.origin)) {
    return {
      url: queryParam,
      type: SafeRedirectType.Remote,
    }
  }
```

If the redirect URL is NOT approved:
- ❌ User redirected to home page instead
- ❌ OAuth flow breaks
- ❌ Partner doesn't get auth code

### Configuration Required

Add to your `.env` file:

```bash
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk,https://nest-forms-backend.bratislava.sk,https://nest-tax-backend.bratislava.sk
```

**Format:** Comma-separated list of origins (protocol + domain, no trailing slash)

### What Happens After Approval

**From `queryParamRedirect.ts` (lines 106-121):**
```typescript
export const getRedirectUrl = async (
  safeRedirect: SafeRedirect,
  fetchAuthSession: () => Promise<AuthSession>,
) => {
  if (safeRedirect.type === SafeRedirectType.Remote) {
    const parsedUrl = new URL(safeRedirect.url)
    const authSession = await fetchAuthSession()
    const accessToken = authSession.tokens?.accessToken.toString()
    if (accessToken) {
      parsedUrl.searchParams.set('access_token', accessToken)  ← Magic!
    }
    return parsedUrl.toString()
  }
  
  return safeRedirect.url
}
```

For approved remote URLs:
1. ✅ Fetches user's current Cognito access token
2. ✅ Adds it as `access_token` query parameter
3. ✅ Returns the full URL with token

## Why No Changes Needed to /prihlasenie

The login page **already does everything we need**:

1. ✅ **Reads `redirect` parameter** (line 37)
   ```typescript
   const { redirect, getRouteWithRedirect, getRedirectQueryParams } = useQueryParamRedirect()
   ```

2. ✅ **Validates redirect URL** (via `getSafeRedirect()`)
   - Checks against `NEXT_PUBLIC_AUTH_APPROVED_ORIGINS`
   - Rejects unsafe URLs

3. ✅ **Adds access token** (via `getRedirectUrl()`)
   - For remote URLs, automatically fetches and adds token
   - Token is fresh (just logged in)

4. ✅ **Redirects after login** (line 62)
   ```typescript
   await redirect()
   ```

## Testing the Flow

### Step 1: Configure Environment
```bash
# In next/.env
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk
```

### Step 2: Trigger OAuth (While Logged Out)
```bash
open "https://nest-city-account.bratislava.sk/oauth/authorize?response_type=code&client_id=dpb-client-id&redirect_uri=https://dpb.example.com/callback&state=test"
```

### Step 3: Observe Flow
1. ✅ Redirected to session check
2. ✅ Session check finds no session
3. ✅ Redirected to `/prihlasenie?redirect=...`
4. ✅ Login page shows
5. ✅ Enter credentials & submit
6. ✅ After login, **automatically** redirected to backend with `access_token`
7. ✅ Backend continues OAuth to Cognito
8. ✅ Cognito auto-approves (SSO)
9. ✅ Partner gets auth code

### Step 4: Check Logs
```
[AUTH] Attempting to sign in for email user@example.com
[AUTH] Successfully signed in for email user@example.com
[Session Check] Redirecting back to: https://nest-city-account.bratislava.sk/oauth/authorize/continue?state=abc123&access_token=eyJ...
```

## Troubleshooting

### Issue: Redirected to home page instead of backend
**Cause:** Backend URL not in `NEXT_PUBLIC_AUTH_APPROVED_ORIGINS`

**Fix:**
```bash
# Add to .env
NEXT_PUBLIC_AUTH_APPROVED_ORIGINS=https://nest-city-account.bratislava.sk
```

### Issue: No access_token in URL
**Cause:** 
- User not actually logged in
- Session expired
- Amplify cookies not set

**Check:**
- Browser dev tools → Application → Cookies
- Look for `CognitoIdentityServiceProvider.*` cookies
- Verify cookies are for correct domain (konto.bratislava.sk)

### Issue: OAuth state expired
**Cause:** User took more than 5 minutes to log in

**Fix:** Try OAuth flow again (automatic cleanup happens)

## Summary

✅ **No changes needed to `/prihlasenie`** - it already works!  
✅ **Just add `NEXT_PUBLIC_AUTH_APPROVED_ORIGINS`** - that's it!  
✅ **Access token automatically added** - by existing code  
✅ **SSO works seamlessly** - user logs in once  

The login page has all the OAuth support built-in through the `useQueryParamRedirect` hook! 🎉
