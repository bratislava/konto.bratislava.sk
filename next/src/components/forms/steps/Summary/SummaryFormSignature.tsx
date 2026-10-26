import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { PropsWithChildren, ReactNode, useMemo } from 'react'
import { FileTrigger } from 'react-aria-components/FileTrigger'

import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormSignerLoader } from '@/src/components/forms/signer/useFormSignerLoader'
import { useSignatureRejectionMessage } from '@/src/components/forms/signer/useSignatureRejectionMessage'
import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import Alert, { AlertProps } from '@/src/components/simple-components/Alert'
import DropdownMenu from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import Spinner from '@/src/components/simple-components/Spinner'
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
  const {
    isLoading: signerIsLoading,
    isReady: signerIsReady,
    isError: signerLoadingFailed,
    isNotSupported: signerIsNotSupported,
    retry: retrySignerLoading,
  } = useFormSignerLoader()
  const {
    sign,
    signWithFile,
    signatureUploadAllowed,
    getSignatureState,
    retrySignatureVerification,
    getSingerDataIsPending,
  } = useFormSignature()
  const { getValidatedSummary } = useFormSummary()
  const getSignatureRejectionMessage = useSignatureRejectionMessage()

  const signatureState = useMemo(() => getSignatureState(), [getSignatureState])
  const signerButtonDisabled =
    isReadonly ||
    !signerIsReady ||
    getSingerDataIsPending ||
    isFormSigningDisabled(getValidatedSummary())

  const signAgainButton = (
    <Button
      variant="link"
      isLoading={signerIsLoading}
      isDisabled={signerButtonDisabled}
      onPress={() => sign()}
    >
      {t('SummaryFormSignature.signAgain')}
    </Button>
  )

  const signatureAlert = (type: AlertProps['type'], message: ReactNode) => (
    <Alert
      type={type}
      message={<SignatureAlertContent>{message}</SignatureAlertContent>}
      className="min-w-full"
    />
  )

  const renderSignatureState = () => {
    switch (signatureState.kind) {
      case 'notRequired':
        // The component is rendered only for signed forms.
        return null
      case 'missing':
        return (
          <Button
            variant="outline"
            isLoading={signerIsLoading}
            isDisabled={signerButtonDisabled}
            onPress={() => sign()}
          >
            {t('SummaryFormSignature.signDocument')}
          </Button>
        )
      case 'outdated':
        return signatureAlert(
          'warning',
          <>
            {t('SummaryFormSignature.outdated')} {signAgainButton}
          </>,
        )
      case 'verifying':
        return signatureAlert(
          'info',
          <span className="flex items-center gap-2">
            <Spinner size="sm" className="shrink-0" />
            {t('SummaryFormSignature.verificationPending')}
          </span>,
        )
      case 'verificationFailed':
        return signatureAlert(
          'error',
          <>
            {t('SummaryFormSignature.verificationFailed')}{' '}
            <Button variant="link" onPress={() => retrySignatureVerification()}>
              {t('SummaryFormSignature.retry')}
            </Button>
          </>,
        )
      case 'rejected':
        return signatureAlert(
          'error',
          <>
            {getSignatureRejectionMessage(signatureState.reason)} {signAgainButton}
          </>,
        )
      case 'valid':
      default:
        return signatureAlert('success', t('SummaryFormSignature.success'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Typography variant="h3">{t('SummaryFormSignature.title')}</Typography>
        <Typography variant="p-small">{t('SummaryFormSignature.description')}</Typography>
      </div>
      {signerIsNotSupported && (
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
      {signerLoadingFailed && (
        <Alert
          type="error"
          message={
            <>
              {t('SummaryFormSignature.loaderError')}{' '}
              <Button variant="link" onPress={() => retrySignerLoading()}>
                {t('SummaryFormSignature.retry')}
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {renderSignatureState()}
      {signatureUploadAllowed && (
        <FileTrigger onSelect={signWithFile} acceptedFileTypes={['.asice']} allowsMultiple={false}>
          <Button variant="outline" isDisabled={isReadonly}>
            {t('SummaryFormSignature.devUploadSignature')}
          </Button>
        </FileTrigger>
      )}
    </div>
  )
}

export default SummaryFormSignature
