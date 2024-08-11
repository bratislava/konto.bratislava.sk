const { withPlausibleProxy } = require('next-plausible')
const { i18n } = require('./next-i18next.config')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { join } = require('node:path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
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
      use: {
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
        },
      },
    })

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: join(__dirname, './node_modules/@iframe-resizer/child/index.umd.js'),
            to: join(__dirname, './public/scripts/iframe-resizer-child.js'),
          },
        ],
      }),
    )

    if (!isServer) {
      // Prevents `getSummaryJsonNode` from being included, see function description for more info
      config.resolve.alias['jsdom'] = false
    }

    // https://github.com/konvajs/konva/issues/1458#issuecomment-1356122802
    config.externals = [...config.externals, { canvas: 'canvas' }]

    return config
  },
}

// https://github.com/4lejandrito/next-plausible#proxy-the-analytics-script
module.exports = withPlausibleProxy()({
  ...withBundleAnalyzer(nextConfig),
})
