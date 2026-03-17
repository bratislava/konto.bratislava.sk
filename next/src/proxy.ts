import { NextRequest, NextResponse } from 'next/server'

import { environment } from '@/src/environment'
import { isDefined } from '@/src/frontend/utils/general'

const slovenskoSkLoginUrlOrigin = new URL(environment.slovenskoSkLoginUrl).origin

// Setting up Content Security Policy with csp header and nonce. Following official docs and our security training
// recommendations. Note that we removed `data:` from `img-src`.
// Docs: https://nextjs.org/docs/15/pages/guides/content-security-policy
const CSP_REPORT_ENDPOINT_NAME = 'csp-endpoint'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isNodeEnvDevelopment = environment.nodeEnv === 'development'

  // const origin = request.nextUrl.origin

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  const host = forwardedHost ?? request.headers.get('host')
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '')

  const origin = `${protocol}://${host}`

  const connectSrc = [
    'https://faro.bratislava.sk',
    'https://cognito-identity.eu-central-1.amazonaws.com',
    // environment.formsUrl,
    environment.cityAccountUrl,
    environment.taxesUrl,
    slovenskoSkLoginUrlOrigin,
    environment.bratislavaStrapiUrl,
    environment.cityAccountStrapiUrl,
  ]
    .filter(isDefined)
    .join(' ')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isNodeEnvDevelopment ? "'unsafe-eval'" : ''} https://slovensko.sk;
    style-src 'self' ${isNodeEnvDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    connect-src 'self' ${connectSrc};
    img-src 'self' blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self' https://olo.sk;
    upgrade-insecure-requests;
    report-uri /api/csp-report;
    report-to ${CSP_REPORT_ENDPOINT_NAME};
`
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replaceAll(/\s{2,}/g, ' ').trim()

  const reportToUrl = `${origin}/api/csp-report`
  const reportingEndpointsValue = `${CSP_REPORT_ENDPOINT_NAME}="${reportToUrl}"`

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set('Content-Security-Policy-Report-Only', contentSecurityPolicyHeaderValue)
  requestHeaders.set('Reporting-Endpoints', reportingEndpointsValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy-Report-Only', contentSecurityPolicyHeaderValue)
  response.headers.set('Reporting-Endpoints', reportingEndpointsValue)
  response.headers.set(
    'Report-To',
    JSON.stringify({
      group: CSP_REPORT_ENDPOINT_NAME,
      max_age: 10886400,
      endpoints: [{ url: reportToUrl }],
    }),
  )

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
