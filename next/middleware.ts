import { NextRequest, NextResponse } from 'next/server'

import { environment } from './environment'

// Setting up Content Security Policy with csp header and nonce. Following official docs and our security training
// recommendations. Note that we removed `data:` from `img-src`.
// Docs: https://nextjs.org/docs/15/pages/guides/content-security-policy
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isNodeEnvDevelopment = environment.nodeEnv === 'development'

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isNodeEnvDevelopment ? "'unsafe-eval'" : ''} https://slovensko.sk;
    style-src 'self' ${isNodeEnvDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    connect-src 'self' https://faro.bratislava.sk https://cognito-identity.eu-central-1.amazonaws.com;
    img-src 'self' blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self' https://olo.sk;
    upgrade-insecure-requests;
`
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replaceAll(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set('Content-Security-Policy-Report-Only', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy-Report-Only', contentSecurityPolicyHeaderValue)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
