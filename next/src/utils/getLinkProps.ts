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
  analyticsProps?: LinkAnalyticsProps
}

export const getLinkProps = (link: CommonLinkFragment | null | undefined) => {
  let href = '#'
  let label = link?.label ?? ''
  let target: '_blank' | undefined

  // To allow setting url query parameters from strapi we use the url field if it starts with '?'
  const queryParams = link?.url?.startsWith('?') ? link.url : ''

  if (!link) {
    return { children: label, href } // TODO?
  }

  // Some content types are not in all strapi link fragments, so we have to check if they exist in the object first
  if ('municipalService' in link && link.municipalService) {
    label = link.label ?? link.municipalService.title
    href = link.municipalService.href
  } else if (link.url && !queryParams) {
    label = link.label ?? link.url
    href = link.url
    target = href.startsWith('http') ? '_blank' : undefined
  }

  if (queryParams) {
    href = `${href}${queryParams}`
  }

  return { children: label, href, target }
}
