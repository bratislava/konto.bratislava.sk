import React from 'react'

import DesktopBreadcrumbs from './DesktopBreadcrumbs'
import MobileBreadcrumbs from './MobileBreadcrumbs'

export type Breadcrumb = {
  title: string
  path: string | null
}

export type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[]
}

/**
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/b8e21a117c691f1f3e3a9be9fa8ae65d4c8172ee/next/src/components/common/Breadcrumbs/Breadcrumbs.tsx#L15
 */

const Breadcrumbs = (props: BreadcrumbsProps) => {
  return (
    <div className="flex flex-col">
      <nav className="hidden lg:block">
        <DesktopBreadcrumbs {...props} />
      </nav>
      <nav className="lg:hidden">
        <MobileBreadcrumbs {...props} />
      </nav>
    </div>
  )
}

export default Breadcrumbs
