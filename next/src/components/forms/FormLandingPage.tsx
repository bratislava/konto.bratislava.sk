import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formsClient } from '@/src/clients/forms'
import { FormWithLandingPageFragment } from '@/src/clients/graphql-strapi/api'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import PageLayout from '@/src/components/layouts/PageLayout'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import FormLandingPageCard from '@/src/components/segments/FormLandingPageCard/FormLandingPageCard'
import useSnackbar from '@/src/frontend/hooks/useSnackbar'
import { isDefined } from '@/src/frontend/utils/general'
import { ROUTES } from '@/src/utils/routes'

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
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

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
      openSnackbarInfo(t('form_landing_page.redirect_info'))
    },
    onSuccess: async (response) => {
      closeSnackbarInfo()
      await router.push(
        ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(formDefinition.slug, response.data.formId),
      )
    },
    onError: () => {
      closeSnackbarInfo()
      openSnackbarError(t('form_landing_page.redirect_error'))
    },
  })

  return (
    <PageLayout>
      <SectionContainer className="size-full bg-gray-50 py-6 lg:min-h-[120px] lg:py-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <h1 className="text-h1-form">{formDefinition.title}</h1>
          {strapiForm.moreInformationUrl ? (
            <Link
              className="w-max text-p1 underline"
              href={strapiForm.moreInformationUrl}
              target="_blank"
            >
              {t('form_header.services_link')}
            </Link>
          ) : null}
        </div>
      </SectionContainer>
      <SectionContainer className="py-6 lg:py-10">
        <div className="flex max-w-[800px] flex-col gap-10">
          {strapiForm.landingPage.text && (
            <AccountMarkdown content={strapiForm.landingPage.text} variant="sm" />
          )}
          <div className="flex flex-col rounded-xl border border-gray-200">
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
        </div>
      </SectionContainer>
    </PageLayout>
  )
}

export default FormLandingPage
