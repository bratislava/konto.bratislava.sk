import { Button, Typography } from '@bratislava/component-library'
import { Trans, useTranslation } from 'next-i18next/pages'
import { mergeProps } from 'react-aria/mergeProps'
import { Heading } from 'react-aria-components/Heading'

import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormRedirects } from '@/src/components/forms/useFormRedirects'
import Icon from '@/src/components/icon-components/Icon'
import { TaxFormPdfExportModalState } from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModalState'
import Dialog from '@/src/components/simple-components/Dialog'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import Spinner from '@/src/components/simple-components/Spinner'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'

type TaxFormPdfExportModalProps = {
  state: TaxFormPdfExportModalState | null
} & ModalProps

const LoadingContent = () => {
  const { t } = useTranslation('account')

  return (
    <div className="flex flex-col items-center gap-6">
      <Spinner size="lg" />
      <div className="flex flex-col gap-3 text-center">
        {/* Accessible Dialog heading */}
        <Heading slot="title" className="text-size-h3-r font-semibold lg:text-size-h3">
          {t('TaxFormPdfExportModal.preparing')}
        </Heading>
        <Typography variant="p-default">
          {t('TaxFormPdfExportModal.preparingDescription')}
        </Typography>
      </div>
    </div>
  )
}

const SuccessContent = () => {
  const { t } = useTranslation('account')
  const { register } = useFormRedirects()
  const {
    formDefinition: { feedbackLink },
  } = useFormContext()
  const { isSignedIn } = useSsrAuth()

  // TODO Translations - cleanup
  const actions = [
    <Trans
      ns="account"
      i18nKey="TaxFormPdfExportModal.actions.1"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="account"
      i18nKey="TaxFormPdfExportModal.actions.2"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="account"
      i18nKey="TaxFormPdfExportModal.actions.3"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="account"
      i18nKey="TaxFormPdfExportModal.actions.4"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
  ]

  const advantages = [
    t('TaxFormPdfExportModal.advantages.1'),
    t('TaxFormPdfExportModal.advantages.2'),
    t('TaxFormPdfExportModal.advantages.3'),
    t('TaxFormPdfExportModal.advantages.4'),
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-[88px] items-center justify-center rounded-full bg-success-100 p-4">
        <Icon name="check" className="size-10 text-success-700" />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          {/* Accessible Dialog heading */}
          <Heading slot="title" className="text-size-h2-r font-semibold lg:text-size-h2">
            {t('TaxFormPdfExportModal.heading')}
          </Heading>
          <Typography variant="p-small">{t('TaxFormPdfExportModal.subheading')}</Typography>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ol className="flex flex-col gap-6 [counter-reset:list-number-styling]">
            {actions.map((translation, index) => (
              <li
                key={index}
                className={cn(
                  'flex text-size-p-large-r [counter-increment:list-number-styling] lg:text-size-p-large',
                  'before:mr-3 before:inline-flex before:size-8 before:shrink-0 before:items-center before:justify-center before:rounded-full before:border before:border-gray-400 before:text-size-p-small-r before:font-semibold before:text-gray-400 before:content-[counter(list-number-styling)] lg:before:mr-4 lg:before:size-8 lg:before:text-size-p-small',
                )}
              >
                <span>{translation}</span>
              </li>
            ))}
          </ol>
        </div>
        {feedbackLink ? (
          <div className="flex w-full flex-col items-center gap-6 rounded-lg bg-gray-100 p-8">
            <Typography variant="h3" className="text-left">
              {t('TaxFormPdfExportModal.feedbackHeading')}
            </Typography>
            <Button
              variant="solid"
              className="w-full"
              href={feedbackLink}
              hasLinkIcon={false}
              target="_blank"
            >
              {t('TaxFormPdfExportModal.feedbackButton')}
            </Button>
          </div>
        ) : null}
        <div className="h-0.5 w-full bg-gray-200" />
        <Typography variant="h3">{t('TaxFormPdfExportModal.howToPayTax')}</Typography>
        <Typography variant="p-large">
          {isSignedIn ? (
            <Trans
              ns="account"
              i18nKey="TaxFormPdfExportModal.taxAssessedStatementAuthenticated"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          ) : (
            <Trans
              ns="account"
              i18nKey="TaxFormPdfExportModal.taxAssessedStatement"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          )}
        </Typography>
        {!isSignedIn && (
          // Copied from RegistrationModal
          <>
            <div className="mt-3 flex w-full items-center lg:mt-6">
              <span className="h-0.5 w-full bg-gray-200" />
              <Typography variant="p-large" as="span" className="px-6">
                {t('TaxFormPdfExportModal.footerChoice')}
              </Typography>
              <span className="h-0.5 w-full bg-gray-200" />
            </div>
            <div>
              <div className="rounded-t-lg bg-gray-100 p-4 lg:px-6 lg:py-5">
                <Typography variant="h4">{t('TaxFormPdfExportModal.accountCreate')}</Typography>
                <ul className="mt-6 flex flex-col gap-2 lg:gap-4">
                  {advantages.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <span className="flex size-5 min-w-[20px] items-center justify-center lg:size-6 lg:min-w-[24px]">
                        <Icon name="check" className="size-7" />
                      </span>
                      <Typography variant="p-small">{item}</Typography>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-b-lg bg-gray-100 px-4 pb-4 lg:px-0 lg:pb-0">
                <Button
                  variant="solid"
                  fullWidth
                  className="rounded-lg px-5 py-2 text-size-p-large-r font-semibold lg:rounded-t-none lg:rounded-b-lg lg:px-0 lg:py-6 lg:text-size-p-large"
                  onPress={() => register()}
                >
                  {t('TaxFormPdfExportModal.accountCreateButton')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Rough version of the modal, some code is copied from RegistrationModal. It will need complex modal refactor in forms
 * in the future.
 */
const TaxFormPdfExportModal = ({ state, ...props }: TaxFormPdfExportModalProps) => {
  return (
    <Modal
      modalOverlayClassname="lg:py-4"
      modalClassname="lg:max-w-[800px] lg:my-4 lg:py-12 lg:px-14"
      mobileFullScreen
      {...mergeProps(props, {
        onOpenChange: (isOpen) => {
          if (!isOpen && state?.type === 'loading') {
            state.onClose()
          }
        },
      } as ModalProps)}
    >
      <Dialog>
        {state?.type === 'loading' && <LoadingContent />}
        {state?.type === 'success' && <SuccessContent />}
      </Dialog>
    </Modal>
  )
}

export default TaxFormPdfExportModal
