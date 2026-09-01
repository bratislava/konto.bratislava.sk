import { withPlausibleProxy } from 'next-plausible'
import i18nextConfig from './next-i18next.config'
import path from 'node:path'
import fs from 'node:fs'
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * Copies the iframe-resizer child script into `public/scripts` and returns its public path.
 *
 * The path contains the version so that the browser does not serve the old cached version when
 * the package is updated.
 *
 * This used to run through Next.js' `adapterPath` hook, but configuring any adapter makes
 * Turbopack skip emitting `.next/next-server.js.nft.json`, which `output: 'standalone'` then
 * fails to read. https://github.com/vercel/next.js/pull/97287
 */
const prepareIframeResizerScript = () => {
  const packagePath = path.join(__dirname, 'node_modules/@iframe-resizer/child/package.json')
  const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as { version?: string }
  if (!version) {
    throw new Error('Iframe resizer child package version not found')
  }

  const publicPath = `/scripts/iframe-resizer-child-${version}.js`

  const sourcePath = path.join(__dirname, 'node_modules/@iframe-resizer/child/index.umd.js')
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Iframe resizer child script not found')
  }

  const targetPath = path.join(__dirname, 'public', publicPath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.copyFileSync(sourcePath, targetPath)

  return publicPath
}

const nextConfig: NextConfig = {
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
  outputFileTracingIncludes: {
    '/**': [
      // tells Next to force-copy the config file into the standalone bundle for all routes, so the runtime require finds it at /home/node/app/next-i18next.config.js
      './next-i18next.config.js',
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
  env: {
    IFRAME_RESIZER_PUBLIC_PATH: prepareIframeResizerScript(),
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
