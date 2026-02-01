import { CheckIcon } from '@assets/ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { mergeProps } from 'react-aria'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'
import ButtonNew from '../../simple-components/ButtonNew'
import Modal, { ModalProps } from '../../simple-components/Modal'
import Spinner from '../../simple-components/Spinner'
import { useFormContext } from '../../useFormContext'
import { useFormRedirects } from '../../useFormRedirects'
import { TaxFormPdfExportModalState } from './TaxFormPdfExportModalState'

type TaxFormPdfExportModalProps = {
  state: TaxFormPdfExportModalState | null
} & ModalProps

const LoadingContent = () => {
  const { t } = useTranslation('forms')

  return (
    <div className="flex flex-col items-center gap-6">
      <Spinner size="lg" />
      <div className="flex flex-col gap-3 text-center">
        <h3 className="text-h3">{t('tax_form_pdf_export_modal.preparing')}</h3>
        <p className="text-p1">{t('tax_form_pdf_export_modal.preparing_description')}</p>
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
          <h2 className="text-h2">{t('tax_form_pdf_export_modal.heading')}</h2>
          <p className="text-p2">{t('tax_form_pdf_export_modal.subheading')}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ol className="flex flex-col gap-6 [counter-reset:list-number-styling]">
            {actions.map((translation, index) => (
              <li
                key={index}
                className="flex text-p1 [counter-increment:list-number-styling] before:mr-3 before:inline-flex before:size-8 before:shrink-0 before:items-center before:justify-center before:rounded-full before:border-2 before:border-gray-400 before:text-h-xs before:font-semibold before:text-gray-400 before:content-[counter(list-number-styling)] lg:before:mr-4 lg:before:size-8"
              >
                <span>{translation}</span>
              </li>
            ))}
          </ol>
        </div>
        {feedbackLink ? (
          <div className="flex w-full flex-col items-center gap-6 rounded-lg bg-gray-100 p-8">
            <h3 className="text-left text-h3">{t('tax_form_pdf_export_modal.feedback_heading')}</h3>
            <ButtonNew variant="black-solid" className="w-full" href={feedbackLink} target="_blank">
              {t('tax_form_pdf_export_modal.feedback_button')}
            </ButtonNew>
          </div>
        ) : null}
        <div className="h-0.5 w-full bg-gray-200" />
        <h3 className="text-h3">{t('tax_form_pdf_export_modal.how_to_pay_tax')}</h3>
        <p className="text-p1">
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
        </p>
        {!isSignedIn && (
          // Copied from RegistrationModal
          <>
            <div className="mt-3 flex w-full items-center md:mt-6">
              <span className="h-0.5 w-full bg-gray-200" />
              <span className="px-6 text-p1">{t('tax_form_pdf_export_modal.footer_choice')}</span>
              <span className="h-0.5 w-full bg-gray-200" />
            </div>
            <div>
              <div className="rounded-t-lg bg-gray-100 p-4 md:px-6 md:py-5">
                <h4 className="text-h4">{t('tax_form_pdf_export_modal.account_create')}</h4>
                <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
                  {advantages.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <span className="flex size-5 min-w-[20px] items-center justify-center md:size-6 md:min-w-[24px]">
                        <CheckIcon className="size-7" />
                      </span>
                      <p className="text-p3 md:text-p1">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-b-lg bg-gray-100 px-4 pb-4 lg:px-0 lg:pb-0">
                <ButtonNew
                  variant="black-solid"
                  fullWidth
                  className="rounded-lg px-5 py-2 text-p1-semibold leading-6 md:rounded-t-none lg:rounded-b-lg lg:px-0 lg:py-6"
                  onPress={() => register()}
                >
                  {t('tax_form_pdf_export_modal.account_create_button')}
                </ButtonNew>
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
