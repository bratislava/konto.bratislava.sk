const { i18n } = require('./next-i18next.config')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cdn-api.bratislava.sk'],
  },
  eslint: {
    dirs: [
      'backend',
      'components',
      'pages',
      'utils'
    ],
    ignore: [
      'backend/forms/**',
      'backend/forms/*',
      'backend/forms/**/*'
    ]
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
        destination: '/mam-problem',
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
