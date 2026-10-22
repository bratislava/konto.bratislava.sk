import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { PropsWithChildren, useMemo } from 'react'

import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormSignerLoader } from '@/src/components/forms/signer/useFormSignerLoader'
import { useSignatureRejectionMessage } from '@/src/components/forms/signer/useSignatureRejectionMessage'
import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import Alert from '@/src/components/simple-components/Alert'
import DropdownMenu from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import { isFormSigningDisabled } from '@/src/frontend/utils/formSummary'

/**
 * TODO: MenuDropdown position fix
 */

const SignatureAlertContent = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation()
  const { sign, remove } = useFormSignature()

  return (
    <div className="flex w-full">
      <span className="grow">{children}</span>
      <div className="ml-2 shrink-0">
        <DropdownMenu
          buttonTrigger={
            <Button
              variant="icon-wrapped-negative-margin"
              size="small"
              icon={<Icon name="menu-kebab" />}
              aria-label={t('SummaryFormSignature.aria.menu')}
            />
          }
          items={[
            {
              title: t('SummaryFormSignature.menu.signAgain'),
              icon: <Icon name="edit" className="size-6" />,
              onPress: () => sign(),
            },
            {
              title: t('SummaryFormSignature.menu.remove'),
              icon: <Icon name="bin" className="size-6" />,
              onPress: () => remove(),
              itemClassName: 'text-negative-700',
            },
          ]}
        />
      </div>
    </div>
  )
}

const SummaryFormSignature = () => {
  const { t } = useTranslation()

  const { isReadonly } = useFormContext()
  const { isLoading, isReady, isError, isNotSupported, retry } = useFormSignerLoader()
  const { signature, sign, isSignatureUpToDate, signatureVerification, getSingerDataIsPending } =
    useFormSignature()
  const { getValidatedSummary } = useFormSummary()
  const getSignatureRejectionMessage = useSignatureRejectionMessage()

  const signatureUpToDate = useMemo(() => isSignatureUpToDate(), [isSignatureUpToDate])
  const signerButtonDisabled =
    isReadonly || !isReady || getSingerDataIsPending || isFormSigningDisabled(getValidatedSummary())

  const signAgainButton = (
    <Button
      variant="link"
      isLoading={isLoading}
      isDisabled={signerButtonDisabled}
      onPress={() => sign()}
    >
      {t('SummaryFormSignature.signAgain')}
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Typography variant="h3">{t('SummaryFormSignature.title')}</Typography>
        <Typography variant="p-small">{t('SummaryFormSignature.description')}</Typography>
      </div>
      {isNotSupported && (
        <Alert
          type="error"
          message={
            <>
              {t('SummaryFormSignature.notSupportedPlatform.message')}{' '}
              <Button href="https://www.slovensko.sk/sk/na-stiahnutie" variant="link">
                {t('SummaryFormSignature.notSupportedPlatform.linkText')}
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {isError && (
        <Alert
          type="error"
          message={
            <>
              {t('SummaryFormSignature.loaderError')}{' '}
              <Button variant="link" onPress={() => retry()}>
                {t('SummaryFormSignature.retry')}
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {signature && !signatureUpToDate && (
        <Alert
          message={
            <SignatureAlertContent>
              {t('SummaryFormSignature.outdated')} {signAgainButton}
            </SignatureAlertContent>
          }
          type="warning"
          className="min-w-full"
        />
      )}
      {signature && signatureUpToDate && signatureVerification.status === 'pending' && (
        <Alert
          message={
            <SignatureAlertContent>
              {t('SummaryFormSignature.verificationPending')}
            </SignatureAlertContent>
          }
          type="info"
          className="min-w-full"
        />
      )}
      {signature && signatureUpToDate && signatureVerification.status === 'rejected' && (
        <Alert
          message={
            <SignatureAlertContent>
              {getSignatureRejectionMessage(signatureVerification.reason)} {signAgainButton}
            </SignatureAlertContent>
          }
          type="error"
          className="min-w-full"
        />
      )}
      {signature &&
        signatureUpToDate &&
        (signatureVerification.status === 'accepted' ||
          signatureVerification.status === 'unverified') && (
          <Alert
            message={
              <SignatureAlertContent>{t('SummaryFormSignature.success')}</SignatureAlertContent>
            }
            type="success"
            className="min-w-full"
          />
        )}
      {!signature && (
        <Button
          variant="outline"
          isLoading={isLoading}
          isDisabled={signerButtonDisabled}
          onPress={() => sign()}
        >
          {t('SummaryFormSignature.signDocument')}
        </Button>
      )}
    </div>
  )
}

export default SummaryFormSignature
