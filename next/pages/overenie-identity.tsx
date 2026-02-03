import { cityAccountClient } from '@clients/city-account'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from 'components/layouts/PageLayout'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import IdentityVerificationOfPhysicalEntityForm, {
  IdentityVerificationOfPhysicalEntityFormData,
} from '../components/forms/auth-forms/IdentityVerificationOfPhysicalEntityForm'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import LegalPersonVerificationPageContent from '../components/verify/LegalPersonVerificationPageContent'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { fetchClientInfo } from '../frontend/utils/fetchClientInfo'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'
import {
  AmplifyClientOAuthProvider,
  useOAuthGetContext,
} from '../frontend/utils/useAmplifyClientOAuthContext'
import { AuthPageCommonProps } from './prihlasenie'

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const clientInfo = await fetchClientInfo(context.query)

    return {
      props: {
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const IdentityVerificationPage = ({ clientInfo }: AuthPageCommonProps) => {
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
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(IdentityVerificationPage)
