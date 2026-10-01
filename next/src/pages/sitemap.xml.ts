import type { GetServerSideProps } from 'next'
import { getServerSideSitemapLegacy, ISitemapField } from 'next-sitemap'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { environment } from '@/src/environment'
import { isDefined } from '@/src/frontend/utils/general'
import { ROUTES } from '@/src/utils/routes'

// Public pages worth indexing. Technical routes (OAuth, SSO, logout, payment status, dev pages, …) are left out.
const STATIC_PATHS = [
  ROUTES.HOME,
  ROUTES.TAXES,
  ROUTES.MUNICIPAL_SERVICES,
  ROUTES.HELP,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOTTEN_PASSWORD,
  ROUTES.IDENTITY_VERIFICATION,
  ROUTES.USER_PROFILE,
  ROUTES.MY_APPLICATIONS,
  ROUTES.PASSWORD_CHANGE,
  ROUTES.EMAIL_CHANGE,
]

const toAbsoluteUrl = (path: string) => new URL(path, environment.siteUrl).toString()

/**
 * Sitemap generated on request, so municipal services added in Strapi appear without a rebuild.
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { municipalServices } = await strapiClient.MunicipalServicesStaticPathsForSitemap({
    limit: -1,
  })

  const fields: ISitemapField[] = [
    ...STATIC_PATHS.map((path) => ({ loc: toAbsoluteUrl(path), changefreq: 'weekly' as const })),
    ...municipalServices.filter(isDefined).map((municipalService) => ({
      loc: toAbsoluteUrl(ROUTES.MUNICIPAL_SERVICES_FORM(municipalService.slug)),
      lastmod: municipalService.updatedAt ?? undefined,
      changefreq: 'weekly' as const,
    })),
  ]

  // Cache on the CDN/proxy, so crawlers don't hit Strapi on every request.
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

  return getServerSideSitemapLegacy(ctx, fields)
}

// The response is written in getServerSideProps, so nothing is rendered.
const Sitemap = () => null

export default Sitemap
