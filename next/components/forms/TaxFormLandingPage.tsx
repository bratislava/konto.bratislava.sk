import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../frontend/api/constants'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import AccountPageLayout from '../layouts/AccountPageLayout'
import PageWrapper from '../layouts/PageWrapper'
import { GetSSRCurrentAuth } from '../logic/ServerSideAuthProvider'
import AccountMarkdown from './segments/AccountMarkdown/AccountMarkdown'
import ButtonNew from './simple-components/ButtonNew'
import Waves from './simple-components/Waves/Waves'

export type TaxFormLandingPageProps = {
  page: { locale: string }
  latestVersionId: string
  ssrCurrentAuthProps?: GetSSRCurrentAuth
}

/**
 * Temporary landing page only for tax form, until we create unified landing page for all forms.
 * The layout is copied from `FormPage` and `FormHeader`.
 */
const TaxFormLandingPage = ({ page, latestVersionId }: TaxFormLandingPageProps) => {
  const router = useRouter()
  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      formsApi.nasesControllerCreateForm(
        {
          schemaVersionId: latestVersionId,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    networkMode: 'always',
    onSuccess: async (response) => {
      await router.push(
        `${ROUTES.MUNICIPAL_SERVICES}/priznanie-k-dani-z-nehnutelnosti/${response.data.id}`,
      )
    },
    onError: () => {
      openSnackbarError(t('tax_form_landing_page.redirect_error'))
    },
  })

  return (
    <PageWrapper locale={page.locale}>
      <AccountPageLayout hiddenHeaderNav isPublicPage>
        <div className="relative flex flex-col">
          <div className="h-full w-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
            <div className="mx-auto flex max-w-screen-lg justify-between">
              <div className="flex flex-col gap-2 lg:gap-4">
                <h1 className="text-h1-form">{t('tax_form_landing_page.title')}</h1>
              </div>
            </div>
          </div>
          <Waves
            className="hidden lg:block"
            waveColor="rgb(var(--color-main-200))"
            wavePosition="bottom"
          />
        </div>
        <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-10 pb-6 pt-0 lg:flex-row lg:gap-20 lg:py-10">
          <div className="flex max-w-[800px] flex-col gap-10">
            <AccountMarkdown content={t('tax_form_landing_page.instructions')} variant="normal" />
            <ButtonNew
              variant="black-outline"
              className="self-end"
              onPress={() => mutate()}
              isLoading={isPending}
            >
              {t('redirect_button')}
            </ButtonNew>
          </div>
        </div>
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default TaxFormLandingPage
