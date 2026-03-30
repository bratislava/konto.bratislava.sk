import { withPlausibleProxy } from 'next-plausible'
import i18nextConfig from './next-i18next.config'
import path from 'node:path'
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  experimental: {
    adapterPath: require.resolve('./next-iframe-resizer-adapter.mjs'),
  },
  i18n: i18nextConfig.i18n,
  reactStrictMode: true,
  // Without transpiling the packages there are two instances of React, and it causes to:
  // https://react.dev/warnings/invalid-hook-call-warning
  transpilePackages: ['forms-shared', '@rjsf/core'],
  images: {
    // After upgrading to Next.js 16, image loading from local IP addresses is blocked.
    // In our Kubernetes setup, S3 resolves to a local IP range (10.10.x.x),
    // which causes images to fail loading.
    // To work around this, we temporarily allow local IPs.
    // TODO: Revisit this setting and implement a safer long-term solution.
    // Docs: https://nextjs.org/docs/pages/api-reference/components/image#dangerouslyallowlocalip
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: `${process.env.MINIO_BUCKET}.s3.bratislava.sk`,
      },
    ],
  },
  output: 'standalone',
  // Workaround: Turbopack file tracer misses `module-sync` exports condition files (e.g. require.mjs)
  // on Node.js >= 22.10. Will be fixed when Next.js bumps @vercel/nft to >= 0.30.0.
  // https://github.com/vercel/next.js/issues/90567
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/**/require.mjs',
      '../forms-shared/node_modules/**/require.mjs',
      '../openapi-clients/node_modules/**/require.mjs',
    ],
  },
  turbopack: {
    // https://github.com/vercel/next.js/issues/73360
    root: path.join(__dirname, '..'),
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                        /* The icons are misplaced when `cleanupIds` is not turned off. */
                        cleanupIds: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
        permanent: true,
      },
      {
        source: '/forgotten-password',
        destination: '/zabudnute-heslo',
        permanent: true,
      },
      {
        source: '/taxes-and-fees',
        destination: '/dane-a-poplatky',
        permanent: true,
      },
      {
        source: '/i-have-a-problem',
        destination: '/pomoc',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/prihlasenie',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/registracia',
        permanent: true,
      },
      {
        source: '/identity-verification',
        destination: '/overenie-identity',
        permanent: true,
      },
      {
        source: '/migration',
        destination: '/aktivacia-konta',
        permanent: true,
      },
      {
        source: '/municipal-services',
        destination: '/mestske-sluzby',
        permanent: true,
      },
      {
        source: '/password-change',
        destination: '/zmena-hesla',
        permanent: true,
      },
      {
        source: '/thank-you',
        destination: '/vysledok-platby',
        permanent: true,
      },
      {
        source: '/user-profile',
        destination: '/moj-profil',
        permanent: true,
      },
      {
        source: '/mam-problem',
        destination: '/pomoc',
        permanent: true,
      },
    ]
  },
}

// https://github.com/4lejandrito/next-plausible#proxy-the-analytics-script
export default withPlausibleProxy()({
  ...bundleAnalyzer(nextConfig),
})
