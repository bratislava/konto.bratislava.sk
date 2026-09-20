import { i18n } from 'next-i18next/pages'
import { ReactNode } from 'react'

import { CommonLinkFragment } from '@/src/clients/graphql-strapi/api'
import { LinkAnalyticsProps } from '@/src/components/simple-components/MLink'

/**
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/utils/getLinkProps.ts
 */

export type CommonLinkProps = {
  children: ReactNode
  href: string
  target?: '_blank'
  'aria-label'?: string
  analyticsProps?: LinkAnalyticsProps
}

export const getLinkProps = (link: CommonLinkFragment | null | undefined) => {
  const { t } = i18n ?? {}

  let href = '#'
  let label = link?.label ?? ''
  let ariaLabel: string | undefined
  let target: '_blank' | undefined

  // To allow setting url query parameters from strapi we use the url field if it starts with '?'
  const queryParams = link?.url?.startsWith('?') ? link.url : ''

  if (!link) {
    return { children: label, href } // TODO?
  }

  // Some content types are not in all strapi link fragments, so we have to check if they exist in the object first
  if ('municipalService' in link && link.municipalService) {
    label = link.label ?? link.municipalService.title
    href = link.municipalService.href ?? '#'
  } else if (link.url && !queryParams) {
    const isExternal = link.url.startsWith('http')
    href = link.url
    label = link.label ?? link.url
    ariaLabel = isExternal ? `${label} - ${t ? t('getLinkProps.openInNewTab') : ''}` : undefined
    target = isExternal ? '_blank' : undefined
  }

  if (queryParams) {
    href = `${href}${queryParams}`
  }

  return { children: label, href, 'aria-label': ariaLabel, target }
}
