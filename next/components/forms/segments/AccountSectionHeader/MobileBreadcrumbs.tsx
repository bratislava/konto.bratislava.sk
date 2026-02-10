import { useTranslation } from 'next-i18next'

import { ChevronDownIcon, ChevronRightIcon } from '@/assets/ui-icons'
import Button from '@/components/forms/simple-components/Button'
import MLink from '@/components/forms/simple-components/MLink'

import type { BreadcrumbsProps } from './Breadcrumbs'

const goBack = () => {
  window.history.back()
}

/**
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%3A-Component-library?node-id=4316-6581&t=h4JAjB29v0Uizs8Y-0
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/b8e21a117c691f1f3e3a9be9fa8ae65d4c8172ee/next/src/components/common/Breadcrumbs/MobileBreadcrumbs.tsx#L22
 */
const MobileBreadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  const { t } = useTranslation('account')
  const withHome = [{ title: t('Breadcrumbs.homepage'), path: '/' }, ...breadcrumbs]
  const withHomeWithoutCurrent = withHome.slice(0, -1)
  const last = withHomeWithoutCurrent.at(-1)
  const showDetails = withHomeWithoutCurrent.length > 0

  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="text-size-p-tiny -mx-4 flex items-center gap-2 font-medium">
          <Button
            onPress={goBack}
            variant="link"
            className="shrink-0 py-3 pl-4 text-[14px]"
            startIcon={<ChevronRightIcon className="shrink-0 rotate-180" />}
          >
            {t('Breadcrumbs.back')}
          </Button>
          <div className="h-4 w-px bg-grey-300" />
          {last?.path ? (
            <MLink href={last.path} variant="underlined" aria-hidden className="truncate py-3 pr-4">
              {last.title}
            </MLink>
          ) : (
            <div className="truncate py-3 pr-4">{last?.title}</div>
          )}
        </div>
      </div>

      {/* TODO: Accordion height animation. */}
      {showDetails && (
        <details className="group">
          <summary className="absolute top-0 right-0 -mr-4 block cursor-pointer p-4">
            <ChevronDownIcon className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="flex flex-col flex-wrap gap-1 py-2">
            {withHomeWithoutCurrent.map((breadcrumb, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className="text-size-p-tiny font-medium" key={index}>
                {breadcrumb.path ? (
                  <MLink href={breadcrumb.path} variant="underlined" className="flex gap-1">
                    <ChevronRightIcon className="size-5 shrink-0 rotate-180" />
                    {breadcrumb.title}
                  </MLink>
                ) : (
                  <div className="flex gap-1">
                    <ChevronRightIcon className="size-5 shrink-0 rotate-180" />
                    {breadcrumb.title}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}

export default MobileBreadcrumbs
