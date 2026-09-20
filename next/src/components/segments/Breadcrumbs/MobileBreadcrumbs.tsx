import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'
import type { BreadcrumbsProps } from '@/src/components/segments/Breadcrumbs/Breadcrumbs'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import MLink from '@/src/components/simple-components/MLink'

const goBack = () => {
  window.history.back()
}

/**
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%3A-Component-library?node-id=4316-6581&t=h4JAjB29v0Uizs8Y-0
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/b8e21a117c691f1f3e3a9be9fa8ae65d4c8172ee/next/src/components/common/Breadcrumbs/MobileBreadcrumbs.tsx#L22
 */
const MobileBreadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  const { t } = useTranslation()

  const withHome = [{ title: t('Breadcrumbs.homepage'), path: '/' }, ...breadcrumbs]
  const withHomeWithoutCurrent = withHome.slice(0, -1)
  const last = withHomeWithoutCurrent.at(-1)
  const showDetails = withHomeWithoutCurrent.length > 0

  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="-mx-4 flex items-center gap-2 text-size-p-tiny font-medium">
          <Button
            onPress={goBack}
            variant="link"
            className="shrink-0 py-3 pl-4 text-[14px]"
            startIcon={<Icon name="chevron-right" className="shrink-0 rotate-180" />}
          >
            {t('Breadcrumbs.back')}
          </Button>
          <div className="h-4 w-px bg-border-passive-primary" />
          {last?.path ? (
            <MLink href={last.path} variant="underlined" aria-hidden className="truncate py-3 pr-4">
              {last.title}
            </MLink>
          ) : (
            <div className="truncate py-3 pr-4">{last?.title}</div>
          )}
        </div>
      </div>

      {showDetails && (
        <Disclosure variant="unstyled">
          <DisclosureHeader className="absolute top-0 right-0 -mr-4 w-fit p-4 ring-inset" />
          <DisclosurePanel innerClassName="py-2">
            <ol className="flex flex-col flex-wrap gap-1">
              {withHomeWithoutCurrent.map((breadcrumb, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li className="text-size-p-tiny font-medium" key={index}>
                  {breadcrumb.path ? (
                    <MLink href={breadcrumb.path} variant="underlined" className="flex gap-1">
                      <Icon name="chevron-right" className="size-5 shrink-0 rotate-180" />
                      {breadcrumb.title}
                    </MLink>
                  ) : (
                    <div className="flex gap-1">
                      <Icon name="chevron-right" className="size-5 shrink-0 rotate-180" />
                      {breadcrumb.title}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </DisclosurePanel>
        </Disclosure>
      )}
    </div>
  )
}

export default MobileBreadcrumbs
