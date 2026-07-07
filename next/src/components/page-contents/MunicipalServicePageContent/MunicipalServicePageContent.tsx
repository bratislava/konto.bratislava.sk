import { Typography } from '@bratislava/component-library'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import TableOfContents from '@/src/components/common/TableOfContents/TableOfContents'
import Markdown from '@/src/components/formatting/Markdown'
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
  const { sections, form: strapiForm } = municipalService

  const filteredSections = sections?.filter(isDefined) ?? []

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
          'mx-auto flex w-full max-w-(--breakpoint-xl) flex-wrap-reverse gap-8 px-4 py-8 lg:px-8 lg:py-12',
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
          {/* TODO: Temporarily showing data from from, until sections are gradually migrated to municipal services. */}
          {filteredSections.length ? (
            <Sections sections={filteredSections} />
          ) : strapiForm?.landingPage?.text ? (
            <SectionContainer>
              <Markdown content={strapiForm.landingPage.text} />
            </SectionContainer>
          ) : null}
        </div>

        <aside className="w-full lg:top-40 lg:w-80 lg:shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </>
  )
}

export default MunicipalServicePageContent
