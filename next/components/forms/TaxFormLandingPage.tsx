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
import TaxFormLandingPageCard, {
  TaxFormLandingPageCardProps,
} from './info-components/TaxFormLandingPageCard'
import AccountMarkdown from './segments/AccountMarkdown/AccountMarkdown'
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
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      formsApi.nasesControllerCreateForm(
        {
          schemaVersionId: latestVersionId,
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
        `${ROUTES.MUNICIPAL_SERVICES}/priznanie-k-dani-z-nehnutelnosti/${response.data.id}`,
      )
    },
    onError: () => {
      closeSnackbarInfo()
      openSnackbarError(t('tax_form_landing_page.redirect_error'))
    },
  })

  const cards: TaxFormLandingPageCardProps[] = [
    {
      title: 'Vyplniť cez Bratislavské konto',
      isEid: false,
      description:
        'Vyplňte daňové priznanie jednoducho, s návodom a pomocnými kalkulačkami, v Bratislavskom konte. PDF si následne stiahnete a odošlete poštou.',
      // icon: BinIcon,
      onPress: () => {
        mutate()
      },
      disabled: isPending,
    },
    {
      title: 'Vyplniť a podať cez esluzby.bratislava.sk',
      isEid: true,
      description:
        'Vyplňte daňové priznanie cez esluzby.bratislava.sk. Na jeho odoslanie potrebujete mať aktívny elektronický občiansky preukaz (eID).',
      // icon: BinIcon,
      href: 'https://esluzby.bratislava.sk/info/203?slug=podavanie-danoveho-priznania-k-dani-z-nehnutelnosti',
    },
    {
      title: 'Stiahnuť PDF priznanie',
      isEid: false,
      description:
        'Ak si prajete vyplniť papierové priznanie ručne, stiahnite si PDF. Vyplnené papierové tlačivo je potrebné odoslať poštou.',
      // icon: BinIcon,
      href: 'https://cdn-api.bratislava.sk/strapi-homepage/upload/Priznanie_k_dani_z_nehnutelnosti_1bda8bd949.pdf',
    },
  ]

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
        <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-10 p-4 pb-6 lg:flex-row lg:gap-20 lg:p-0 lg:py-10">
          <div className="flex max-w-[800px] flex-col gap-10">
            <AccountMarkdown content={t('tax_form_landing_page.instructions')} variant="sm" />
            <div className="flex flex-col gap-3">
              <h2 className="text-h2">Vyberte si ako vyplníte priznanie:</h2>
              <div className="flex flex-col rounded-xl border-2 border-gray-200">
                {cards.map((card, index) => (
                  <TaxFormLandingPageCard key={index} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default TaxFormLandingPage
