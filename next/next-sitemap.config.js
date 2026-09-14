const { strapiClient } = require('./dist/clients/graphql-strapi/index')
const { ROUTES } = require('./dist/utils/routes')

//  Documentation: https://www.npmjs.com/package/next-sitemap

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_NODE_ENV === 'production'
      ? 'https://konto.bratislava.sk'
      : process.env.NEXT_PUBLIC_SELF_URL,
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
        lastMod: municipalService.lastMod,
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
