import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { FormWithLandingPageFragment } from '@/src/clients/graphql-strapi/api'
import TableOfContents from '@/src/components/common/TableOfContents/TableOfContents'
import Markdown from '@/src/components/formatting/Markdown'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import FormLandingPageCtaCard from '@/src/components/page-contents/FormLandingPageContent/FormCta/FormLandingPageCtaCard'
import FormLandingPageCard from '@/src/components/segments/FormLandingPageCard/FormLandingPageCard'
import MLink from '@/src/components/simple-components/MLink'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=14475-7297
 */

export type FormWithLandingPageRequiredFragment = Omit<
  FormWithLandingPageFragment,
  'landingPage'
> & {
  landingPage: NonNullable<FormWithLandingPageFragment['landingPage']>
}

export const PAGE_CONTENT_ID = 'page-content'

export type FormLandingPageProps = {
  formDefinition: ClientLandingPageFormDefinition
  moreInformationUrl?: string
  strapiForm: FormWithLandingPageRequiredFragment
}

// TODO: Remove this page completely, after full migration to municipal service page
const FormLandingPage = ({ formDefinition, strapiForm }: FormLandingPageProps) => {
  const { t } = useTranslation('forms')

  return (
    <>
      {/* Header */}
      <SectionContainer className="size-full bg-background-passive-primary py-6 lg:min-h-[120px] lg:py-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1">{formDefinition.title}</Typography>
          {strapiForm.moreInformationUrl ? (
            <MLink
              className="w-max text-size-p-large-r lg:text-size-p-large"
              variant="underlined"
              href={strapiForm.moreInformationUrl}
              target="_blank"
            >
              {t('form_header.services_link')}
            </MLink>
          ) : null}
        </div>
      </SectionContainer>

      {/* Sections & Sidebar */}
      <div
        key={formDefinition.slug} // Helps to re-render table of contents on page change
        className="mx-auto flex w-full max-w-(--breakpoint-xl) flex-wrap-reverse gap-8 px-4 py-8 lg:px-8 lg:py-12"
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
          id={PAGE_CONTENT_ID}
        >
          {strapiForm.landingPage.text ? (
            <SectionContainer>
              <Markdown variant="small" content={strapiForm.landingPage.text} />
            </SectionContainer>
          ) : null}

          <SectionContainer>
            <div className="flex flex-col rounded-xl border">
              {strapiForm.landingPage.linkCtas?.filter(isDefined).map((linkCta) => (
                <FormLandingPageCard key={linkCta.id} {...linkCta} />
              ))}
              {isDefined(strapiForm.landingPage.formCta) ? (
                <FormLandingPageCtaCard
                  formCta={strapiForm.landingPage.formCta}
                  formDefinition={formDefinition}
                />
              ) : null}
            </div>
          </SectionContainer>
        </div>

        <aside className="w-full lg:top-40 lg:w-80 lg:shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </>
  )
}

export default FormLandingPage
