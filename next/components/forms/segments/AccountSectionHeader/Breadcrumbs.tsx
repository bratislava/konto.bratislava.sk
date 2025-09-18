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
