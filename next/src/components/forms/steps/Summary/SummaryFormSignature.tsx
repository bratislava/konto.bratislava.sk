import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { PropsWithChildren, useMemo } from 'react'

import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormSignerLoader } from '@/src/components/forms/signer/useFormSignerLoader'
import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import Alert from '@/src/components/simple-components/Alert'
import MenuDropdown from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { isFormSigningDisabled } from '@/src/frontend/utils/formSummary'

/**
 * TODO: MenuDropdown position fix
 */

const SummaryFormSignature = () => {
  const { t } = useTranslation('forms')
  const { isReadonly } = useFormContext()
  const { isLoading, isReady, isError, isNotSupported, retry } = useFormSignerLoader()
  const { signature, sign, isValidSignature, remove, getSingerDataIsPending } = useFormSignature()
  const { getValidatedSummary } = useFormSummary()

  const validSignature = useMemo(() => isValidSignature(), [isValidSignature])
  const signerButtonDisabled =
    isReadonly || !isReady || getSingerDataIsPending || isFormSigningDisabled(getValidatedSummary())

  const AlertContent = ({ children }: PropsWithChildren) => (
    <div className="flex w-full">
      <span className="grow">{children}</span>
      <div className="ml-2 shrink-0">
        <MenuDropdown
          buttonTrigger={
            <Button
              variant="icon-wrapped-negative-margin"
              size="small"
              icon={<Icon name="menu-kebab" />}
              aria-label={t('form_signature.menu_aria_label')}
            />
          }
          items={[
            {
              title: t('form_signature.menu.sign_again'),
              icon: <Icon name="edit" className="size-6" />,
              onPress: () => sign(),
            },
            {
              title: t('form_signature.menu.remove'),
              icon: <Icon name="bin" className="size-6" />,
              onPress: () => remove(),
              itemClassName: 'text-negative-700',
            },
          ]}
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Typography variant="h3">{t('form_signature.title')}</Typography>
        <Typography variant="p-small">{t('form_signature.description')}</Typography>
      </div>
      {isNotSupported && (
        <Alert
          type="error"
          message={
            <>
              {t('form_signature.not_supported_platform.message')}{' '}
              <Button href="https://www.slovensko.sk/sk/na-stiahnutie" variant="link">
                {t('form_signature.not_supported_platform.link_text')}
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
              {t('form_signature.loader_error')}{' '}
              <Button variant="link" onPress={() => retry()}>
                {t('form_signature.retry')}
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {signature &&
        (validSignature ? (
          <Alert
            message={<AlertContent>{t('form_signature.success')}</AlertContent>}
            type="success"
            className="min-w-full"
          />
        ) : (
          <Alert
            message={
              <AlertContent>
                {t('form_signature.outdated')}{' '}
                <Button
                  variant="link"
                  isLoading={isLoading}
                  isDisabled={signerButtonDisabled}
                  onPress={() => sign()}
                >
                  {t('form_signature.sign_again')}
                </Button>
              </AlertContent>
            }
            type="warning"
            className="min-w-full"
          />
        ))}
      {!signature && (
        <Button
          variant="outline"
          isLoading={isLoading}
          isDisabled={signerButtonDisabled}
          onPress={() => sign()}
        >
          {t('form_signature.sign_document')}
        </Button>
      )}
    </div>
  )
}

export default SummaryFormSignature
