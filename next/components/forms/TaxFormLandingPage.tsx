import { Castle48PxIcon, Pdf48PxIcon, Tax48PxIcon } from '@assets/ui-icons'
import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../frontend/api/constants'
import { useQueryParamRedirect } from '../../frontend/hooks/useQueryParamRedirect'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import AccountPageLayout from '../layouts/AccountPageLayout'
import TaxFormLandingPageCard, {
  TaxFormLandingPageCardProps,
} from './info-components/TaxFormLandingPageCard'
import AccountMarkdown from './segments/AccountMarkdown/AccountMarkdown'
import ButtonNew from './simple-components/ButtonNew'
import Waves from './simple-components/Waves/Waves'

export type TaxFormLandingPageProps = {
  latestVersionId: string
}

/**
 * Temporary landing page only for tax form, until we create unified landing page for all forms.
 * The layout is copied from `FormPage` and `FormHeader`.
 */
const TaxFormLandingPage = ({ latestVersionId }: TaxFormLandingPageProps) => {
  const { isSignedIn, userAttributes } = useSsrAuth()
  const isBetaUser = userAttributes?.['custom:2024_tax_form_beta'] === 'true'
  const router = useRouter()
  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()

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

  const cards = [
    {
      title: 'Vyplniť cez Bratislavské konto',
      isEid: false,
      id: 'bratislavske-konto',
      description: isBetaUser ? (
        <>
          Vyplňte priznanie jednoducho, <strong>s návodom a pomocnými kalkulačkami</strong>, v
          Bratislavskom konte. Priznanie na konci buď <strong>podpíšete a odošlete s eID</strong>{' '}
          alebo <strong>stiahnete ako PDF</strong>, ktoré odošlete poštou.
        </>
      ) : (
        'Vyplňte daňové priznanie jednoducho, s návodom a pomocnými kalkulačkami. V Bratislavskom konte, aj bez registrácie. PDF si následne stiahnete a odošlete poštou.'
      ),
      icon: Castle48PxIcon,
      onPress: () => {
        mutate()
      },
      disabled: isPending,
      isBetaUser,
    },
    isBetaUser
      ? null
      : {
          title: 'Vyplniť a podať cez esluzby.bratislava.sk',
          id: 'esluzby-bratislava-sk',
          isEid: true,
          description:
            'Vyplňte daňové priznanie cez esluzby.bratislava.sk. Na jeho odoslanie potrebujete mať aktívny elektronický občiansky preukaz (eID).',
          icon: Tax48PxIcon,
          href: 'https://esluzby.bratislava.sk/info/203?slug=podavanie-danoveho-priznania-k-dani-z-nehnutelnosti',
          isBetaUser,
        },
    {
      title: 'Stiahnuť PDF priznanie',
      id: 'pdf-priznanie',
      isEid: false,
      description:
        'Ak si prajete vyplniť papierové priznanie ručne, stiahnite si PDF. Vyplnené papierové tlačivo je potrebné odoslať poštou.',
      icon: Pdf48PxIcon,
      href: 'https://cdn-api.bratislava.sk/strapi-homepage/upload/Priznanie_k_dani_z_nehnutelnosti_1bda8bd949.pdf',
      isBetaUser,
    },
  ].filter(Boolean) as TaxFormLandingPageCardProps[]

  return (
    <AccountPageLayout hiddenHeaderNav>
      <div className="relative flex flex-col">
        <div className="size-full bg-main-200 p-4 md:py-6 lg:min-h-[120px] lg:px-0 lg:py-12">
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
            {!isSignedIn && (
              <p className="text-p2">
                Ak ste súčasťou <strong>beta testovania</strong> nového odosielania s eID, prosím{' '}
                <ButtonNew href={getRouteWithCurrentUrlRedirect(ROUTES.LOGIN)} variant="black-link">
                  prihláste sa
                </ButtonNew>{' '}
                do svojho Bratislavského konta.
              </p>
            )}
            <div className="flex flex-col rounded-xl border-2 border-gray-200">
              {cards.map((card, index) => (
                <TaxFormLandingPageCard key={index} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AccountPageLayout>
  )
}

export default TaxFormLandingPage
