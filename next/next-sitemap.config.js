const { strapiClient } = require('./dist/clients/graphql-strapi/index')

//  Documentation: https://www.npmjs.com/package/next-sitemap

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SELF_URL,
  generateRobotsTxt: false,
  changefreq: 'weekly',
  sitemapSize: 7000,
  // generate paths dynamically from Strapi
  additionalPaths: async (config) => {
    const fetchFormPaths = async () => {
      const { forms } = await strapiClient.FormsStaticPaths({ limit: -1 })

      return forms.map((form) => ({
        loc: `/mestske-sluzby/${form.slug}`,
      }))
    }

    const [formPaths] = await Promise.all([fetchFormPaths()])
    const paths = [...formPaths]

    return paths.map((path) => ({
      loc: path.loc,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }))
  },
}
