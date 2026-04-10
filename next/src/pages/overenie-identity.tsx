import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import { cityAccountClient } from '@/src/clients/city-account'
import { strapiClient } from '@/src/clients/graphql-strapi'
import IdentityVerificationOfPhysicalEntityForm, {
  IdentityVerificationOfPhysicalEntityFormData,
} from '@/src/components/auth-forms/IdentityVerificationOfPhysicalEntityForm'
import LegalPersonVerificationPageContent from '@/src/components/auth-forms/LegalPersonVerificationPageContent'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import {
  AmplifyClientOAuthProvider,
  useOAuthGetContext,
} from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useRefreshServerSideProps } from '@/src/frontend/hooks/useRefreshServerSideProps'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from '@/src/frontend/utils/errors'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import logger from '@/src/frontend/utils/logger'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const [general, clientInfo] = await Promise.all([
      strapiClient.General(),
      fetchClientInfo(context.query),
    ])

    return {
      props: {
        general,
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const IdentityVerificationPage = ({ general, clientInfo }: AuthPageCommonProps) => {
  const { redirect } = useQueryParamRedirect()
  const { t } = useTranslation('account')
  const [lastRc, setLastRc] = useState('')
  const [lastIdCard, setLastIdCard] = useState('')

  const { isOAuthLogin, clientTitle, storeTokensAndRedirect, isIdentityVerificationRequired } =
    useOAuthGetContext(clientInfo)

  const [identityVerificationError, setIdentityVerificationError] = useState<Error | null>(null)
  // TODO fix is legal entity
  const { tierStatus, isLegalEntity } = useSsrAuth()

  const { refreshData } = useRefreshServerSideProps(tierStatus)

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setIdentityVerificationError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const verifyIdentityAndRefreshUserData = async (
    data: IdentityVerificationOfPhysicalEntityFormData,
  ) => {
    setLastRc(data.rc)
    setLastIdCard(data.idCard)
    handleErrorChange(null)

    try {
      await cityAccountClient.verificationControllerVerifyBirthNumberAndIdentityCard(
        {
          birthNumber: data.rc.replace('/', ''),
          identityCard: data.idCard.toUpperCase(),
          turnstileToken: data.turnstileToken,
        },
        { authStrategy: 'authOnly' },
      )
      // give the queue a few seconds to process the verification
      await new Promise((resolve) => {
        setTimeout(resolve, 8000)
      })
      // status will be set according to current cognito tier - pending if still processing
      await refreshData()
      if (tierStatus.isNotVerifiedIdentityCard) {
        handleErrorChange(
          new ErrorWithName(
            'Unsuccessful identity verification',
            'unsuccessful-identity-verification',
          ),
        )
      }
    } catch (error) {
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyIdentityAndRefreshUserData:`,
          error,
        )
        handleErrorChange(new Error('Unknown error'))
      }
    }
  }

  return (
    <AmplifyClientOAuthProvider clientInfo={clientInfo}>
      <GeneralContextProvider general={general}>
        <PageLayout variant="auth" hideBackButton>
          <AccountContainer ref={accountContainerRef}>
            {(tierStatus.isIdentityVerificationNotYetAttempted ||
              tierStatus.isNotVerifiedIdentityCard) && (
              <>
                {isLegalEntity ? (
                  <LegalPersonVerificationPageContent
                    showSkipButton={!isIdentityVerificationRequired}
                  />
                ) : (
                  <IdentityVerificationOfPhysicalEntityForm
                    onSubmit={verifyIdentityAndRefreshUserData}
                    error={identityVerificationError}
                    showSkipButton={!isIdentityVerificationRequired}
                  />
                )}
              </>
            )}
            {tierStatus.isInQueue && (
              <AccountSuccessAlert
                variant="pending"
                title={t('auth.identity_verification.fo.pending.title')}
                {...(isOAuthLogin
                  ? {
                      confirmLabel: t('auth.oauth_page.continue_to_oauth_origin', { clientTitle }),
                      onConfirm: () => {
                        // TODO OAuth: What to do here whe identity verification is pending?
                      },
                      description:
                        lastRc && lastIdCard
                          ? t('auth.identity_verification.fo.pending_oauth.content', {
                              rc: lastRc,
                              idCard: lastIdCard,
                              clientTitle,
                            })
                          : t('auth.identity_verification.fo.pending_oauth.content_without_data', {
                              clientTitle,
                            }),
                    }
                  : {
                      confirmLabel: t('auth.continue_to_account'),
                      onConfirm: () => {
                        redirect()
                      },
                      description:
                        lastRc && lastIdCard
                          ? t('auth.identity_verification.fo.pending.content', {
                              rc: lastRc,
                              idCard: lastIdCard,
                            })
                          : t('auth.identity_verification.fo.pending.content_without_data'),
                    })}
              />
            )}
            {tierStatus.isIdentityVerified && (
              <AccountSuccessAlert
                variant="success"
                title={t('auth.identity_verification.common.success.title')}
                description={
                  isLegalEntity
                    ? t('auth.identity_verification.fop_po_eid.success.content')
                    : lastRc &&
                      lastIdCard &&
                      t('auth.identity_verification.fo.success.content', {
                        rc: lastRc,
                        idCard: lastIdCard,
                      })
                }
                {...(isOAuthLogin
                  ? {
                      confirmLabel: t('auth.oauth_page.continue_to_oauth_origin', { clientTitle }),
                      onConfirm: () => {
                        storeTokensAndRedirect()
                      },
                    }
                  : {
                      confirmLabel: t('auth.continue_to_account'),
                      onConfirm: () => {
                        redirect()
                      },
                    })}
              />
            )}
          </AccountContainer>
        </PageLayout>
      </GeneralContextProvider>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(IdentityVerificationPage)
