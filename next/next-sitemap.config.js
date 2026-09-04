const { strapiClient } = require('./dist/clients/graphql-strapi/index')
const { routes } = require('./dist/routes/index')

//  Documentation: https://www.npmjs.com/package/next-sitemap

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SELF_URL,
  generateRobotsTxt: false,
  changefreq: 'weekly',
  sitemapSize: 5000,
  // generate paths dynamically from Strapi
  additionalPaths: async (config) => {
    const fetchMunicipalServicePaths = async () => {
      const { municipalServices } = await strapiClient.MunicipalServicesStaticPaths({ limit: -1 })

      return municipalServices.map((municipalService) => ({
        loc: routes.MUNICIPAL_SERVICES_FORM(municipalService.slug),
      }))
    }

    const paths = await fetchMunicipalServicePaths()

    return paths.map((path) => ({
      loc: path.loc,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }))
  },
}
