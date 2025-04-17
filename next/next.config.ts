import { withPlausibleProxy } from 'next-plausible'
import { i18n } from './next-i18next.config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path, { join } from 'node:path'
import fs from 'node:fs'
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'
import type { Config as SvgrConfig } from '@svgr/core'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const iframeResizerPublicPath = (() => {
  const packagePath = path.join(__dirname, './node_modules/@iframe-resizer/child/package.json')
  const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  // The path must contain the version so that the browser does not serve the old cached version when the package is updated.
  return `/scripts/iframe-resizer-child-${version}.js`
})()

const iframeResizerSourcePath = join(__dirname, './node_modules/@iframe-resizer/child/index.umd.js')
const iframeResizerTargetPath = join(__dirname, 'public', iframeResizerPublicPath)

if (process.env.TURBOPACK) {
  // Turbopack doesn't support CopyWebpackPlugin, so we need to copy the file manually. This is fine as Turbopack is
  // only used in development mode.
  fs.mkdirSync(path.dirname(iframeResizerTargetPath), { recursive: true })
  fs.copyFileSync(iframeResizerSourcePath, iframeResizerTargetPath)
}

const svgrLoader = {
  loader: '@svgr/webpack',
  options: {
    svgoConfig: {
      plugins: [
        {
          name: 'removeViewBox',
          active: false,
        },
      ],
    },
  } satisfies SvgrConfig,
}

const nextConfig: NextConfig = {
  env: {
    IFRAME_RESIZER_PUBLIC_PATH: iframeResizerPublicPath,
  },
  i18n,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cdn-api.bratislava.sk',
      },
    ],
  },
  output: 'standalone',
  eslint: {
    dirs: ['components/', 'pages/', 'utils/', 'backend/', 'frontend/'],
  },
  turbopack: {
    // https://github.com/vercel/next.js/issues/73360
    root: path.join(__dirname, '..'),
    rules: {
      '*.svg': {
        loaders: [svgrLoader],
        as: '*.js',
      },
    },
    resolveAlias: {
      react: 'react',
      'react-dom': 'react-dom',
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
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: svgrLoader,
    })

    // See `IframeResizerChild.tsx`
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: iframeResizerSourcePath,
            to: iframeResizerTargetPath,
          },
        ],
      }),
    )

    // https://github.com/konvajs/konva/issues/1458#issuecomment-1356122802
    config.externals = [...config.externals, { canvas: 'canvas' }]

    // In `forms-shared` we have React, and it acts as a duplicate of the React in the app in local development
    // (because the package is symlinked).
    // It causes the error: `You might have more than one copy of React in the same app`.
    // This is a temporary solution until the packages are installed using npm workspaces.
    // https://blog.elantha.com/more-than-one-copy-of-react-in-the-same-app/
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    }

    return config
  },
}

// https://github.com/4lejandrito/next-plausible#proxy-the-analytics-script
export default withPlausibleProxy()({
  ...bundleAnalyzer(nextConfig),
})
