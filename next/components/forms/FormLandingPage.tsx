import { formsApi } from '@clients/forms'
import { FormWithLandingPageFragment } from '@clients/graphql-strapi/api'
import { useMutation } from '@tanstack/react-query'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { isDefined } from 'frontend/utils/general'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../frontend/api/constants'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import AccountPageLayout from '../layouts/AccountPageLayout'
import FormLandingPageCard from './info-components/FormLandingPageCard'
import AccountMarkdown from './segments/AccountMarkdown/AccountMarkdown'
import Waves from './simple-components/Waves/Waves'

export type FormWithLandingPageRequiredFragment = Omit<
  FormWithLandingPageFragment,
  'landingPage'
> & {
  landingPage: NonNullable<FormWithLandingPageFragment['landingPage']>
}

export type FormLandingPageProps = {
  formDefinition: FormDefinition
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
      formsApi.nasesControllerCreateForm(
        {
          formDefinitionSlug: formDefinition.slug,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    networkMode: 'always',
    onMutate: () => {
      openSnackbarInfo(t('tax_form_landing_page.redirect_info'))
    },
    onSuccess: async (response) => {
      closeSnackbarInfo()
      await router.push(
        ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(formDefinition.slug, response.data.id),
      )
    },
    onError: () => {
      closeSnackbarInfo()
      openSnackbarError(t('tax_form_landing_page.redirect_error'))
    },
  })

  return (
    <AccountPageLayout>
      <div className="relative flex flex-col">
        <div className="size-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
          <div className="mx-auto flex max-w-screen-lg justify-between">
            <div className="flex flex-col gap-2 lg:gap-4">
              <h1 className="text-h1-form">{formDefinition.title}</h1>
              {strapiForm.moreInformationUrl ? (
                <Link
                  className="text-p1-underline w-max"
                  href={strapiForm.moreInformationUrl}
                  target="_blank"
                >
                  {t('form_header.services_link')}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <Waves
          className="hidden lg:block"
          waveColor="rgb(var(--color-main-200))"
          wavePosition="bottom"
        />
      </div>
      <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-10 p-4 pb-6 lg:flex-row lg:gap-20 lg:p-0 lg:py-10">
        <div className="flex max-w-[800px] flex-col gap-10">
          {strapiForm.landingPage.text && (
            <AccountMarkdown content={strapiForm.landingPage.text} variant="sm" />
          )}
          <div className="flex flex-col rounded-xl border-2 border-gray-200">
            {strapiForm.landingPage.linkCtas
              ?.filter(isDefined)
              .map((linkCta) => <FormLandingPageCard key={linkCta.id} {...linkCta} />)}
            <FormLandingPageCard
              {...strapiForm.landingPage.formCta}
              isLoading={isPending}
              onPress={() => {
                mutate()
              }}
            />
          </div>
        </div>
      </div>
    </AccountPageLayout>
  )
}

export default FormLandingPage