import { ChevronDownIcon, ChevronRightIcon } from '@assets/ui-icons'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import MLinkNew from 'components/forms/simple-components/MLinkNew'
import { useTranslation } from 'next-i18next'

import type { BreadcrumbsProps } from './Breadcrumbs'

const goBack = () => {
  window.history.back()
}

/**
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%3A-Component-library?node-id=4316-6581&t=h4JAjB29v0Uizs8Y-0
 */
const MobileBreadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  const { t } = useTranslation()
  const withHome = [{ title: t('breadcrumbs.homepage'), path: '/' }, ...breadcrumbs]
  const withHomeWithoutCurrent = withHome.slice(0, -1)
  const last = withHomeWithoutCurrent.at(-1)
  const showDetails = withHomeWithoutCurrent.length > 0

  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="text-size-p-tiny -mx-4 flex items-center gap-2 font-medium">
          <ButtonNew
            onPress={goBack}
            variant="black-link"
            className="shrink-0 py-3 pl-4 text-[14px]"
            startIcon={<ChevronRightIcon className="shrink-0 rotate-180" />}
          >
            {t('breadcrumbs.back')}
          </ButtonNew>
          <div className="bg-grey-300 h-4 w-px" />
          {last?.path ? (
            <MLinkNew
              href={last.path}
              variant="underlined"
              aria-hidden
              className="truncate py-3 pr-4"
            >
              {last.title}
            </MLinkNew>
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
                  <MLinkNew href={breadcrumb.path} variant="underlined" className="flex gap-1">
                    <ChevronRightIcon className="size-5 shrink-0 rotate-180" />
                    {breadcrumb.title}
                  </MLinkNew>
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
