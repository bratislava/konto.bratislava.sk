const { i18n } = require('./next-i18next.config')
const { ROUTES } = require('@utils/constants')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cdn-api.bratislava.sk'],
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
        destination: ROUTES.FORGOTTEN_PASSWORD,
        permanent: true,
      },
      {
        source: '/taxes-and-fees',
        destination: ROUTES.TAXES_AND_FEES,
        permanent: true,
      },
      {
        source: '/i-have-a-problem',
        destination: ROUTES.I_HAVE_A_PROBLEM,
        permanent: true,
      },
      {
        source: '/login',
        destination: ROUTES.LOGIN,
        permanent: true,
      },
      {
        source: '/migration',
        destination: ROUTES.MIGRATION,
        permanent: true,
      },
      {
        source: '/municipal-services',
        destination: ROUTES.MUNICIPAL_SERVICES,
        permanent: true,
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    // used for loading eform xml template
    config.module.rules.push({ test: /\.xml$/, loader: 'xml-loader' })

    return config
  },
}

module.exports = nextConfig
