import { Typography } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { formsClient } from '@/src/clients/forms'
import { FormWithLandingPageFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Sections from '@/src/components/layouts/Sections'
import FormLandingPageCard from '@/src/components/segments/FormLandingPageCard/FormLandingPageCard'
import MLink from '@/src/components/simple-components/MLink'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=14475-7297
 */

export type FormWithLandingPageRequiredFragment = Omit<
  FormWithLandingPageFragment,
  'landingPage'
> & {
  landingPage: NonNullable<FormWithLandingPageFragment['landingPage']>
}

export type FormLandingPageProps = {
  formDefinition: ClientLandingPageFormDefinition
  moreInformationUrl?: string
  strapiForm: FormWithLandingPageRequiredFragment
}

const FormLandingPage = ({ formDefinition, strapiForm }: FormLandingPageProps) => {
  const router = useRouter()
  const { t } = useTranslation('forms')
  const { showToast, closeToasts } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      formsClient.formsV2ControllerCreateForm(
        {
          formDefinitionSlug: formDefinition.slug,
        },
        { authStrategy: 'authOrGuestWithToken' },
      ),
    networkMode: 'always',
    onMutate: () => {
      showToast({
        message: t('form_landing_page.redirect_info'),
        variant: 'info',
        // Keep this toast visible for the whole redirect flow; it is closed explicitly after navigation succeeds.
        duration: Number.MAX_SAFE_INTEGER,
      })
    },
    onSuccess: async (response) => {
      await router.push(
        ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(formDefinition.slug, response.data.formId),
      )
      // Close the redirect toast only after a successful route change so it stays visible until the user is redirected.
      closeToasts()
    },
    onError: () => {
      showToast({ message: t('form_landing_page.redirect_error'), variant: 'error' })
    },
  })

  const filteredSections = strapiForm.landingPage.sections?.filter(isDefined) ?? []

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
          {/* TODO - For now we keep the original richtext - remove this after migration to new richtext section */}
          {strapiForm.landingPage.text ? (
            <SectionContainer>
              <Markdown variant="small" content={strapiForm.landingPage.text} />
            </SectionContainer>
          ) : null}

          <Sections sections={filteredSections} />

          <SectionContainer>
            <div className="flex flex-col rounded-xl border">
              {strapiForm.landingPage.linkCtas?.filter(isDefined).map((linkCta) => (
                <FormLandingPageCard key={linkCta.id} {...linkCta} />
              ))}
              <FormLandingPageCard
                {...strapiForm.landingPage.formCta}
                isLoading={isPending}
                onPress={() => {
                  mutate()
                }}
              />
            </div>
          </SectionContainer>
        </div>
        {/* TODO Sidebar goes here */}
      </div>
    </>
  )
}

export default FormLandingPage
