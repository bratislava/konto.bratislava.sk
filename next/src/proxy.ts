import { NextRequest, NextResponse } from 'next/server'

import { environment } from '@/src/environment'
import { isDefined } from '@/src/frontend/utils/general'

const slovenskoSkLoginUrlOrigin = new URL(environment.slovenskoSkLoginUrl).origin

// Setting up Content Security Policy with csp header and nonce. Following official docs and our security training
// recommendations. Note that we removed `data:` from `img-src`.
// Docs: https://nextjs.org/docs/15/pages/guides/content-security-policy
//
// Notes:
// - You can check violations directly in the browser DevTools > Application > Reporting API
// - Reporting may not work on internal network, because the request does not hit Cloudflare that adds X-Forwarded-* headers.

const CSP_REPORT_ENDPOINT_NAME = 'csp-endpoint'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isNodeEnvDevelopment = environment.nodeEnv === 'development'

  // Reconstruct the public origin from X-Forwarded-* headers.
  // In Kubernetes behind an ingress, request.nextUrl.origin points to the internal
  // pod hostname (e.g. service:3000), but we need the browser-facing origin for
  // correct CSP reporting endpoints.
  // In proxy chains, this headers can contain multiple comma-separated values — we take the first one.
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const host = forwardedHost ?? request.headers.get('host')
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '')

  const origin = `${protocol}://${host}`

  const connectSrc = [
    'https://faro.bratislava.sk',
    'https://cognito-identity.eu-central-1.amazonaws.com',
    environment.formsUrl,
    environment.cityAccountUrl,
    environment.taxesUrl,
    slovenskoSkLoginUrlOrigin,
    environment.bratislavaStrapiUrl,
    environment.cityAccountStrapiUrl,

    // Microsoft Clarity - script is loaded via strict-dynamic / tag manager
    // Docs: https://learn.microsoft.com/sk-sk/clarity/setup-and-installation/clarity-csp
    'https://*.clarity.ms',
    'https://c.bing.com',

    // Google Tag manager
    // Docs: https://developers.google.com/tag-platform/security/guides/csp
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',

    // Cookiebot config fetch. Note: See also frame-src below.
    // Docs: https://support.cookiebot.com/hc/en-us/articles/360018907220-Cookiebot-and-Content-Security-Protocol-CSP
    'https://consentcdn.cookiebot.eu',
    'https://consent.cookiebot.eu',
  ]
    .filter(isDefined)
    .join(' ')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isNodeEnvDevelopment ? "'unsafe-eval'" : ''};
    style-src 'self' ${isNodeEnvDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    connect-src 'self' ${connectSrc};
    img-src 'self' blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self' https://olo.sk;
    frame-src 'self' https://consentcdn.cookiebot.eu;
    upgrade-insecure-requests;
    report-uri /api/csp-report;
    report-to ${CSP_REPORT_ENDPOINT_NAME};
`
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replaceAll(/\s{2,}/g, ' ').trim()

  const reportToUrl = `${origin}/api/csp-report`
  const reportingEndpointsValue = `${CSP_REPORT_ENDPOINT_NAME}="${reportToUrl}"`

  // Forward the generated nonce via a request header, so the rendering layer (_document.tsx)
  // can read it and attach the same nonce to inline scripts/styles.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Send CSP and reporting configuration to the browser.
  // - `Reporting-Endpoints` is the modern Reporting API endpoint definition.
  // - `Report-To` is the legacy header still required by some browsers.
  // Both reporting headers are sent for backward compatibility.
  // TODO change Content-Security-Policy-Report-Only to Content-Security-Policy when ready
  response.headers.set('Content-Security-Policy-Report-Only', contentSecurityPolicyHeaderValue)
  // TODO Temporarily enable only frame-ancestors policy to prevent Click-jacking attacks. Remove when whole CSP is enabled
  response.headers.set('Content-Security-Policy', `frame-ancestors 'self' https://olo.sk;`)
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
