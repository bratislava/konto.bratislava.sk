# How Cognito Identifies Users in OAuth Flow

## Your Question
"When using the authorize endpoint, how does Cognito know which user just signed in?"

## The Answer

**Cognito recognizes the user through the browser session established when they logged in with Amplify.**

## The Complete Flow

```
1. Partner (DPB) → nest-city-account/oauth/authorize
   ?client_id=dpb-client-id
   &redirect_uri=https://dpb.example.com/callback
   &response_type=code

2. nest-city-account → konto.bratislava.sk/prihlasenie
   ?cognito_redirect=https://cognito.../oauth2/authorize?client_id=...

3a. User ALREADY logged in (SSO):
    - SSR detects user is authenticated
    - Immediately redirects to: Cognito OAuth authorize endpoint
    - Total time: ~2 seconds ⚡

3b. User NOT logged in:
    - Shows login form
    - User enters credentials
    - Amplify signIn() succeeds
    - Frontend redirects to: Cognito OAuth authorize endpoint

4. Cognito OAuth authorize endpoint:
   - Checks browser session (from Amplify login)
   - Recognizes user identity ✅
   - Auto-approves authorization
   - Redirects to: https://dpb.example.com/callback?code=AUTH_CODE

5. DPB exchanges code for tokens with Cognito
   Gets: access_token, id_token, refresh_token for that specific user
```

## How Cognito Knows the User Identity

### Step 1: Amplify Login Creates Session
When user logs in via `signIn()` at konto.bratislava.sk:

```typescript
const { isSignedIn } = await signIn({ username: email, password })
```

This:
1. Authenticates against Cognito User Pool
2. Gets tokens (access_token, id_token, refresh_token)
3. Stores tokens in browser (cookies + localStorage)
4. **Establishes session with Cognito**

### Step 2: Redirect to Cognito OAuth
After successful login, frontend redirects to Cognito's OAuth authorize endpoint:

```typescript
if (cognitoRedirect) {
  window.location.href = cognitoRedirect
  // e.g., https://cognito.../oauth2/authorize?client_id=dpb&redirect_uri=...
}
```

### Step 3: Cognito Recognizes the Session
When the browser hits Cognito's OAuth authorize endpoint:

1. **Same browser** that just logged in via Amplify
2. **Same Cognito User Pool** (both Amplify and OAuth use it)
3. Cognito checks: "Is this browser authenticated?"
4. Finds the session from Step 1
5. Knows exactly which user it is! (sub, email, etc.)
6. Auto-approves the OAuth authorization

### Why This Works

✅ **Same User Pool**: Amplify authentication and Cognito OAuth both use the SAME Cognito User Pool  
✅ **Same Browser Session**: User doesn't leave the browser between login and OAuth  
✅ **Cognito Session Cookies**: Set during Amplify login, recognized by OAuth endpoint  
✅ **No Additional Login**: User doesn't need to log in again at Cognito's UI  

## Implementation Summary

### Backend (`nest-city-account`)

**oauth.controller.ts:**
```typescript
@Get('authorize')
async authorize(@Query() authorizeDto, @Req() req, @Res() res) {
  // Build Cognito authorize URL
  const cognitoUrl = this.oauthService.buildCognitoAuthorizeUrl(
    authorizeDto,
    req.partner
  )

  // Redirect to login with cognito_redirect parameter
  const loginUrl = new URL(this.oauthService.getFrontendLoginUrl())
  loginUrl.searchParams.set('cognito_redirect', cognitoUrl)
  
  res.redirect(loginUrl.toString())
}
```

**oauth.service.ts:**
```typescript
buildCognitoAuthorizeUrl(authorizeDto, partner): string {
  const params = new URLSearchParams({
    response_type: authorizeDto.response_type,
    client_id: partner.clientId,
    redirect_uri: authorizeDto.redirect_uri,
    scope: authorizeDto.scope || 'openid profile email',
  })
  
  // Add state, code_challenge, nonce, etc.
  
  return `${this.cognitoDomain}/oauth2/authorize?${params.toString()}`
}
```

### Frontend (`konto.bratislava.sk`)

**pages/prihlasenie.tsx SSR:**
```typescript
export const getServerSideProps = amplifyGetServerSideProps(
  async (context) => {
    const cognitoRedirect = context.query.cognito_redirect
    
    // SSO: If user already logged in, skip login page!
    if (cognitoRedirect) {
      return {
        redirect: {
          destination: cognitoRedirect,
          permanent: false,
        },
      }
    }
    
    return { props: { ... } }
  },
  { requiresSignOut: true, redirectQueryParam: true },
)
```

**After Login:**
```typescript
const onLogin = async (email, password) => {
  const { isSignedIn } = await signIn({ username: email, password })
  
  if (isSignedIn) {
    // ... user creation logic ...
    
    // Check for OAuth flow
    const cognitoRedirect = router.query.cognito_redirect
    if (cognitoRedirect) {
      // Redirect to Cognito OAuth - it will recognize the session!
      window.location.href = cognitoRedirect
      return
    }
    
    // Normal redirect
    await redirect()
  }
}
```

## Benefits of This Approach

✅ **Custom Login UI** - Users see your branded konto.bratislava.sk/prihlasenie  
✅ **Cognito Handles OAuth** - Standard OAuth 2.0 flow, no custom code  
✅ **SSO Works** - Already-logged-in users get instant authorization  
✅ **Secure** - All tokens generated by Cognito, not custom code  
✅ **Simple** - Frontend and backend just do redirects  
✅ **Standards Compliant** - Partners use standard OAuth 2.0  

## Session Recognition Details

### How Cognito Tracks Sessions

When Amplify's `signIn()` succeeds:
1. Cognito generates tokens (access, ID, refresh)
2. Sets HTTP cookies for session tracking
3. These cookies are sent on subsequent requests to Cognito endpoints

When browser visits Cognito OAuth authorize:
1. Sends those session cookies automatically
2. Cognito validates cookies
3. Extracts user identity (sub, email, etc.)
4. Generates authorization code for that specific user

### Token Flow

```
User Login (Amplify)
  ↓
Cognito authenticates
  ↓
Returns: access_token (contains user sub, email, etc.)
  ↓
Browser stores tokens + session cookies
  ↓
Redirect to Cognito OAuth authorize
  ↓
Browser sends session cookies
  ↓
Cognito reads cookies, knows the user
  ↓
Generates auth code for that user
  ↓
Partner exchanges code
  ↓
Gets tokens for that specific user
```

## Testing

### Test SSO Flow (User Already Logged In)

```bash
# 1. Log in first
open https://konto.bratislava.sk/prihlasenie
# Enter credentials, log in

# 2. Trigger OAuth
open "https://nest-city-account.bratislava.sk/oauth/authorize?client_id=dpb&redirect_uri=https://dpb.example.com/callback&response_type=code"

# Expected:
# → Redirects to /prihlasenie?cognito_redirect=...
# → SSR detects user logged in
# → Immediately redirects to Cognito (no login form!)
# → Cognito recognizes session, auto-approves
# → Partner gets auth code
# Total: ~2 seconds, seamless! 🎉
```

### Test Regular Flow (User Not Logged In)

```bash
# 1. Make sure logged out
open https://konto.bratislava.sk/odhlasenie

# 2. Trigger OAuth (same URL as above)

# Expected:
# → Redirects to /prihlasenie?cognito_redirect=...
# → SSR detects user NOT logged in
# → Shows login form
# → User enters credentials
# → After signIn(), redirects to Cognito
# → Cognito recognizes fresh session
# → Auto-approves authorization
# → Partner gets auth code
```

## Summary

**Your question:** "How does Cognito know which user signed in?"

**The answer:** 
1. User logs in with Amplify at your custom login page
2. Amplify establishes session with Cognito (same User Pool)
3. Frontend redirects to Cognito's OAuth authorize endpoint
4. **Same browser session** = Cognito recognizes the user
5. Cognito generates authorization code for that specific user
6. Partner exchanges code and gets tokens for that user

**Key insight:** Amplify login and Cognito OAuth share the same Cognito User Pool and session, so the user doesn't need to log in twice!

✅ **Custom UI + Cognito OAuth + No custom auth code generation = Simple and compliant!**
