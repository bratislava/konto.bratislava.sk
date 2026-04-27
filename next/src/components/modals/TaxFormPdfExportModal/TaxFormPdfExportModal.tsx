import { Button, Typography } from '@bratislava/component-library'
import { Trans, useTranslation } from 'next-i18next/pages'
import { mergeProps } from 'react-aria'

import { CheckIcon } from '@/src/assets/ui-icons'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormRedirects } from '@/src/components/forms/useFormRedirects'
import { TaxFormPdfExportModalState } from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModalState'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import Spinner from '@/src/components/simple-components/Spinner'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'

type TaxFormPdfExportModalProps = {
  state: TaxFormPdfExportModalState | null
} & ModalProps

const LoadingContent = () => {
  const { t } = useTranslation('forms')

  return (
    <div className="flex flex-col items-center gap-6">
      <Spinner size="lg" />
      <div className="flex flex-col gap-3 text-center">
        <Typography variant="h3">{t('tax_form_pdf_export_modal.preparing')}</Typography>
        <Typography variant="p-default">
          {t('tax_form_pdf_export_modal.preparing_description')}
        </Typography>
      </div>
    </div>
  )
}

const SuccessContent = () => {
  const { t } = useTranslation('forms')
  const { register } = useFormRedirects()
  const {
    formDefinition: { feedbackLink },
  } = useFormContext()
  const { isSignedIn } = useSsrAuth()

  // TODO Translations - cleanup
  const actions = [
    <Trans
      ns="forms"
      i18nKey="tax_form_pdf_export_modal.action_1"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="forms"
      i18nKey="tax_form_pdf_export_modal.action_2"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="forms"
      i18nKey="tax_form_pdf_export_modal.action_3"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
    <Trans
      ns="forms"
      i18nKey="tax_form_pdf_export_modal.action_4"
      components={{ strong: <strong className="font-semibold" /> }}
    />,
  ]

  const advantages = [
    t('tax_form_pdf_export_modal.advantage_1'),
    t('tax_form_pdf_export_modal.advantage_2'),
    t('tax_form_pdf_export_modal.advantage_3'),
    t('tax_form_pdf_export_modal.advantage_4'),
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-[88px] items-center justify-center rounded-full bg-success-100 p-4">
        <CheckIcon className="size-10 text-success-700" />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <Typography variant="h2">{t('tax_form_pdf_export_modal.heading')}</Typography>
          <Typography variant="p-small">{t('tax_form_pdf_export_modal.subheading')}</Typography>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ol className="flex flex-col gap-6 [counter-reset:list-number-styling]">
            {actions.map((translation, index) => (
              <li
                key={index}
                className={cn(
                  'flex text-size-p-small-r [counter-increment:list-number-styling] lg:text-size-p-large',
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
              {t('tax_form_pdf_export_modal.feedback_heading')}
            </Typography>
            <Button
              variant="solid"
              className="w-full"
              href={feedbackLink}
              hasLinkIcon={false}
              target="_blank"
            >
              {t('tax_form_pdf_export_modal.feedback_button')}
            </Button>
          </div>
        ) : null}
        <div className="h-0.5 w-full bg-gray-200" />
        <Typography variant="h3">{t('tax_form_pdf_export_modal.how_to_pay_tax')}</Typography>
        <Typography variant="p-default">
          {isSignedIn ? (
            <Trans
              ns="forms"
              i18nKey="tax_form_pdf_export_modal.tax_assessed_statement_authenticated"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          ) : (
            <Trans
              ns="forms"
              i18nKey="tax_form_pdf_export_modal.tax_assessed_statement"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          )}
        </Typography>
        {!isSignedIn && (
          // Copied from RegistrationModal
          <>
            <div className="mt-3 flex w-full items-center md:mt-6">
              <span className="h-0.5 w-full bg-gray-200" />
              <span className="text-p1 px-6">{t('tax_form_pdf_export_modal.footer_choice')}</span>
              <span className="h-0.5 w-full bg-gray-200" />
            </div>
            <div>
              <div className="rounded-t-lg bg-gray-100 p-4 md:px-6 md:py-5">
                <Typography variant="h4">
                  {t('tax_form_pdf_export_modal.account_create')}
                </Typography>
                <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
                  {advantages.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <span className="flex size-5 min-w-[20px] items-center justify-center md:size-6 md:min-w-[24px]">
                        <CheckIcon className="size-7" />
                      </span>
                      <Typography variant="p-tiny" className="lg:text-size-p-large">
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-b-lg bg-gray-100 px-4 pb-4 lg:px-0 lg:pb-0">
                <Button
                  variant="solid"
                  fullWidth
                  className="text-p1-semibold rounded-lg px-5 py-2 leading-6 md:rounded-t-none lg:rounded-b-lg lg:px-0 lg:py-6"
                  onPress={() => register()}
                >
                  {t('tax_form_pdf_export_modal.account_create_button')}
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
const TaxFormPdfExportModal = ({ state, ...props }: TaxFormPdfExportModalProps) => (
  <Modal
    modalOverlayClassname="md:py-4"
    modalClassname="md:max-w-[800px] md:my-4 md:py-12 md:px-14"
    mobileFullScreen
    {...mergeProps(props, {
      onOpenChange: (isOpen) => {
        if (!isOpen && state?.type === 'loading') {
          state.onClose()
        }
      },
    } as ModalProps)}
  >
    {state?.type === 'loading' && <LoadingContent />}
    {state?.type === 'success' && <SuccessContent />}
  </Modal>
)

export default TaxFormPdfExportModal
