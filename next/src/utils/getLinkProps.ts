import { ReactNode } from 'react'

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

// TODO add getLinkProps function
