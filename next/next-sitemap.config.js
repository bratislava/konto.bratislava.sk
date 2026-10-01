const { GraphQLClient } = require('graphql-request')

const { getSdk } = require('./dist/clients/graphql-strapi/api')
const { ROUTES } = require('./dist/utils/routes')

//  Documentation: https://www.npmjs.com/package/next-sitemap

// next-sitemap runs as a separate process after `next build`, so `@/src/environment` can't be used here:
// it asserts variables like NODE_ENV or IFRAME_RESIZER_PUBLIC_PATH that only `next build` provides.
// next-sitemap loads the .env files itself, so read the variables directly and needs to load strapiClient here.
const cityAccountStrapiUrl = process.env.NEXT_PUBLIC_CITY_ACCOUNT_STRAPI_URL
if (!cityAccountStrapiUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_CITY_ACCOUNT_STRAPI_URL')
}

const strapiClient = getSdk(new GraphQLClient(`${cityAccountStrapiUrl}/graphql`))

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: false,
  changefreq: 'weekly',
  sitemapSize: 5000,
  // generate paths dynamically from Strapi
  additionalPaths: async (config) => {
    const fetchMunicipalServicePaths = async () => {
      const { municipalServices } = await strapiClient.MunicipalServicesStaticPathsForSitemap({
        limit: -1,
      })

      return municipalServices.map((municipalService) => ({
        loc: ROUTES.MUNICIPAL_SERVICES_FORM(municipalService.slug),
        lastMod: municipalService.updatedAt,
      }))
    }

    const paths = await fetchMunicipalServicePaths()

    return paths.map((path) => ({
      loc: path.loc,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: path.lastMod,
      alternateRefs: config.alternateRefs ?? [],
    }))
  },
}
