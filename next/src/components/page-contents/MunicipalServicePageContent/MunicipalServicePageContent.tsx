import { Typography } from '@bratislava/component-library'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Sections from '@/src/components/layouts/Sections'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=14475-7297
 */

export type MunicipalServicePageContentProps = {
  municipalService: MunicipalServiceEntityFragment
}

const MunicipalServicePageContent = ({ municipalService }: MunicipalServicePageContentProps) => {
  const filteredSections = municipalService.sections?.filter(isDefined) ?? []

  return (
    <>
      {/* Header */}
      <SectionContainer className="size-full bg-background-passive-primary py-6 lg:min-h-[120px] lg:py-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1">{municipalService.title}</Typography>
          {/* TODO text and moreInfo link? */}
        </div>
      </SectionContainer>

      {/* Sections & Sidebar */}
      <div
        key={municipalService.slug} // Helps to re-render table of contents on page change
        className={cn(
          'mx-auto flex w-full max-w-(--breakpoint-xl) flex-wrap-reverse px-4 py-8 lg:px-8 lg:py-12',
        )}
      >
        <div
          className={cn(
            'w-full max-w-200',
            '**:data-section-container-outer:not-first:pt-8',
            '**:data-section-container-outer:not-first:lg:pt-12',
            // In sidebar layout, horizontal padding is handled by parent wrapper (otherwise it is handled by sections)
            '**:data-section-container-inner:px-0',
            '**:data-section-container-inner:lg:px-0',
          )}
        >
          <Sections sections={filteredSections} />
        </div>
        {/* TODO Sidebar goes here */}
      </div>
    </>
  )
}

export default MunicipalServicePageContent
