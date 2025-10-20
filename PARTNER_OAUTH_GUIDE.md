# Partner OAuth Integration Guide

## For: DPB and MPA Partners

This guide explains how to integrate with Bratislava's OAuth/OIDC provider for user authentication.

---

## Quick Start

### 1. OAuth Endpoints

All OAuth endpoints are on `konto.bratislava.sk`:

| Endpoint | URL | Method |
|----------|-----|--------|
| **Authorization** | `https://konto.bratislava.sk/api/oauth/authorize` | GET |
| **Token** | `https://konto.bratislava.sk/api/oauth/token` | POST |
| **UserInfo** | `https://konto.bratislava.sk/api/oauth/userinfo` | GET |
| **Logout** | `https://konto.bratislava.sk/api/oauth/logout` | GET |
| **Discovery** | `https://konto.bratislava.sk/api/oauth/.well-known/openid-configuration` | GET |
| **JWKS** | `https://konto.bratislava.sk/api/oauth/.well-known/jwks.json` | GET |

### 2. Credentials

You will receive from Bratislava:
- **Client ID**: e.g., `dpb-client-id`
- **Client Secret**: e.g., `your-secret-key`
- **Redirect URIs**: Your whitelisted callback URLs

### 3. Supported Features

✅ Authorization Code flow  
✅ PKCE (Proof Key for Code Exchange)  
✅ Refresh tokens  
✅ OpenID Connect (ID tokens)  
✅ Single Sign-On (SSO)  
✅ Session logout  

---

## Integration Flow

### Step 1: Authorization Request

Redirect your users to the authorization endpoint:

```
https://konto.bratislava.sk/api/oauth/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_CALLBACK_URL
  &scope=openid+profile+email
  &state=RANDOM_STATE
  &code_challenge=YOUR_PKCE_CHALLENGE      (optional but recommended)
  &code_challenge_method=S256               (optional but recommended)
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `response_type` | Yes | Must be `code` |
| `client_id` | Yes | Your client ID provided by Bratislava |
| `redirect_uri` | Yes | One of your whitelisted callback URLs |
| `scope` | No | Default: `openid profile email` |
| `state` | Recommended | Random string for CSRF protection |
| `code_challenge` | Recommended | PKCE challenge (SHA256 hash of verifier) |
| `code_challenge_method` | Recommended | `S256` or `plain` |
| `nonce` | Optional | Random string for ID token validation |

**User Experience:**
- If user is already logged in → automatic authorization (SSO, ~2 seconds)
- If user is not logged in → redirected to Bratislava login page

### Step 2: Handle Callback

User is redirected back to your `redirect_uri` with:

```
https://your-app.com/callback
  ?code=AUTHORIZATION_CODE
  &state=YOUR_STATE
```

**Verify:**
1. ✅ Check `state` matches what you sent
2. ✅ Extract the `code` parameter

### Step 3: Exchange Code for Tokens

Make a server-side POST request to exchange the authorization code for tokens:

```http
POST https://konto.bratislava.sk/api/oauth/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=YOUR_CALLBACK_URL
&code_verifier=YOUR_PKCE_VERIFIER    (if you used PKCE)
```

**Alternative:** Send credentials in body instead of header:
```
grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=YOUR_CALLBACK_URL
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
```

**Response:**
```json
{
  "access_token": "eyJraWQiOiJx...",
  "id_token": "eyJraWQiOiJx...",
  "refresh_token": "eyJjdHkiOiJKV1Q...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Step 4: Get User Information

Use the access token to get user information:

```http
GET https://konto.bratislava.sk/api/oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

**Response:**
```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "email_verified": true,
  "given_name": "Ján",
  "family_name": "Novák",
  "name": "Ján Novák"
}
```

### Step 5: Verify ID Token (Optional)

The `id_token` is a JWT that can be verified using the JWKS:

1. Get public keys: `GET https://konto.bratislava.sk/api/oauth/.well-known/jwks.json`
2. Verify JWT signature using RS256 algorithm
3. Validate claims:
   - `iss`: Should be Cognito issuer URL
   - `aud`: Should be your `client_id`
   - `exp`: Token not expired
   - `nonce`: Matches what you sent (if used)

---

## Refresh Tokens

To get a new access token using a refresh token:

```http
POST https://konto.bratislava.sk/api/oauth/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=refresh_token
&refresh_token=YOUR_REFRESH_TOKEN
```

**Response:**
```json
{
  "access_token": "new-access-token...",
  "id_token": "new-id-token...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## Logout

To log out a user:

```
https://konto.bratislava.sk/api/oauth/logout
  ?client_id=YOUR_CLIENT_ID
  &logout_uri=YOUR_LOGOUT_CALLBACK_URL
  &state=RANDOM_STATE
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Optional | Your client ID |
| `logout_uri` | Optional | URL to redirect after logout (must be whitelisted) |
| `state` | Optional | State parameter to preserve |

**Behavior:**
- Logs out user from Bratislava's system
- Logs out from ALL integrated partners (SSO logout)
- Redirects to `logout_uri` or default page

---

## Code Examples

### Node.js / Express

```javascript
const express = require('express')
const axios = require('axios')
const crypto = require('crypto')

const app = express()

// 1. Redirect to authorization
app.get('/login', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex')
  req.session.state = state

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    scope: 'openid profile email',
    state: state
  })

  res.redirect(`https://konto.bratislava.sk/api/oauth/authorize?${params}`)
})

// 2. Handle callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query

  // Verify state
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state')
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://konto.bratislava.sk/api/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const { access_token, id_token, refresh_token } = tokenResponse.data

    // Get user info
    const userResponse = await axios.get(
      'https://konto.bratislava.sk/api/oauth/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      }
    )

    const user = userResponse.data

    // Store tokens in session
    req.session.accessToken = access_token
    req.session.refreshToken = refresh_token
    req.session.user = user

    res.redirect('/dashboard')
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message)
    res.status(500).send('Authentication failed')
  }
})

// 3. Logout
app.get('/logout', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    logout_uri: process.env.OAUTH_LOGOUT_URI
  })

  req.session.destroy()
  res.redirect(`https://konto.bratislava.sk/api/oauth/logout?${params}`)
})
```

### Python / Flask

```python
import requests
from flask import Flask, redirect, request, session
from urllib.parse import urlencode
import secrets

app = Flask(__name__)
app.secret_key = 'your-secret-key'

CLIENT_ID = 'your-client-id'
CLIENT_SECRET = 'your-client-secret'
REDIRECT_URI = 'https://your-app.com/callback'
OAUTH_BASE = 'https://konto.bratislava.sk/api/oauth'

@app.route('/login')
def login():
    state = secrets.token_hex(32)
    session['state'] = state
    
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope': 'openid profile email',
        'state': state
    }
    
    return redirect(f"{OAUTH_BASE}/authorize?{urlencode(params)}")

@app.route('/callback')
def callback():
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Verify state
    if state != session.get('state'):
        return 'Invalid state', 400
    
    # Exchange code for tokens
    token_response = requests.post(
        f"{OAUTH_BASE}/token",
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }
    )
    
    tokens = token_response.json()
    access_token = tokens['access_token']
    
    # Get user info
    user_response = requests.get(
        f"{OAUTH_BASE}/userinfo",
        headers={'Authorization': f"Bearer {access_token}"}
    )
    
    user = user_response.json()
    session['user'] = user
    session['access_token'] = access_token
    
    return redirect('/dashboard')

@app.route('/logout')
def logout():
    params = {
        'client_id': CLIENT_ID,
        'logout_uri': 'https://your-app.com/logged-out'
    }
    
    session.clear()
    return redirect(f"{OAUTH_BASE}/logout?{urlencode(params)}")
```

---

## Security Best Practices

### 1. Use PKCE
Always use PKCE for enhanced security:
```javascript
const crypto = require('crypto')

// Generate verifier
const verifier = crypto.randomBytes(32).toString('base64url')

// Generate challenge
const challenge = crypto
  .createHash('sha256')
  .update(verifier)
  .digest('base64url')

// Send challenge in authorization request
// Send verifier in token request
```

### 2. Validate State Parameter
Always generate and verify the `state` parameter to prevent CSRF attacks.

### 3. Store Secrets Securely
- Never commit `client_secret` to version control
- Use environment variables
- Rotate secrets periodically

### 4. Validate Tokens
- Verify ID token signature using JWKS
- Check token expiration
- Validate issuer and audience claims

### 5. Use HTTPS Only
All OAuth communication must use HTTPS.

---

## Testing

### OpenID Configuration
Get all OAuth endpoints:
```bash
curl https://konto.bratislava.sk/api/oauth/.well-known/openid-configuration
```

### Test Authorization (Browser)
```
https://konto.bratislava.sk/api/oauth/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_CALLBACK_URL
  &scope=openid+profile+email
  &state=test123
```

### Test Token Exchange (curl)
```bash
curl -X POST https://konto.bratislava.sk/api/oauth/token \
  -u "client_id:client_secret" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=YOUR_CALLBACK_URL"
```

### Test UserInfo (curl)
```bash
curl https://konto.bratislava.sk/api/oauth/userinfo \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## Troubleshooting

### Error: `invalid_client`
- Check your client ID is correct
- Verify client secret is correct
- Ensure credentials match in authorization and token requests

### Error: `invalid_redirect_uri`
- Ensure redirect URI is whitelisted
- Check for exact match (including protocol, domain, port, path)
- URL encode the redirect URI in requests

### Error: `invalid_grant`
- Authorization code may have expired (valid for 5 minutes)
- Authorization code can only be used once
- Ensure redirect URI matches the one used in authorization request

### SSO not working
- User must be logged into `konto.bratislava.sk`
- Clear browser cookies and try again
- Check that you're redirecting to the correct domain

---

## Support

For integration support, contact:
- **Email**: [support email]
- **Documentation**: See `OAUTH_ARCHITECTURE.md` for technical details
- **Issue Tracker**: [if applicable]

---

## Changelog

### v1.0 (Current)
- Initial OAuth/OIDC implementation
- Authorization Code flow
- PKCE support
- Single Sign-On (SSO)
- Session logout
- Refresh tokens
