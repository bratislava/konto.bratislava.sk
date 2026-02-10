import { useTranslation } from 'next-i18next'

import { ChevronRightIcon, HomeIcon } from '@/assets/ui-icons'
import MLink from '@/components/forms/simple-components/MLink'

import type { BreadcrumbsProps } from './Breadcrumbs'

/**
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%3A-Component-library?node-id=821-1994&t=pIPe0xK0FBdmOKH1-0
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/b8e21a117c691f1f3e3a9be9fa8ae65d4c8172ee/next/src/components/common/Breadcrumbs/DesktopBreadcrumbs.tsx#L11
 */

const DesktopBreadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  const { t } = useTranslation('account')

  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5 py-3 lg:py-6">
      <li>
        <MLink
          href="/"
          variant="underlined"
          className="shrink-0"
          aria-label={t('Breadcrumbs.homepage')}
        >
          <HomeIcon className="size-5 shrink-0" />
        </MLink>
      </li>
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          // eslint-disable-next-line react/no-array-index-key
          <li className="text-size-p-tiny flex gap-1 font-medium" key={index}>
            <ChevronRightIcon className="size-5 shrink-0" aria-hidden />
            {breadcrumb.path && !isLast ? (
              <MLink href={breadcrumb.path} variant="underlined">
                {breadcrumb.title}
              </MLink>
            ) : (
              breadcrumb.title
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default DesktopBreadcrumbs
