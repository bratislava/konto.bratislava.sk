import { CheckIcon } from '@assets/ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { mergeProps } from 'react-aria'
import { Button as AriaButton } from 'react-aria-components'

import { useServerSideAuth } from '../../../../frontend/hooks/useServerSideAuth'
import ButtonNew from '../../simple-components/ButtonNew'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'
import Spinner from '../../simple-components/Spinner'
import { useFormRedirects } from '../../useFormRedirects'
import { TaxFormPdfExportModalState } from './TaxFormPdfExportModalState'

export const taxFeedbackUrl = 'https://bravo.staffino.com/bratislava/id=WW14qo6q'

type TaxFormPdfExportModalProps = {
  state: TaxFormPdfExportModalState | null
} & ModalV2Props

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
  const { isAuthenticated } = useServerSideAuth()

  const actions = [
    'tax_form_pdf_export_modal.action_1',
    'tax_form_pdf_export_modal.action_2',
    'tax_form_pdf_export_modal.action_3',
    'tax_form_pdf_export_modal.action_4',
  ]

  const advantages = [
    t('tax_form_pdf_export_modal.advantage_1'),
    t('tax_form_pdf_export_modal.advantage_2'),
    t('tax_form_pdf_export_modal.advantage_3'),
    t('tax_form_pdf_export_modal.advantage_4'),
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-success-100 p-4">
        <CheckIcon className="h-10 w-10 text-success-700" />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-h2">{t('tax_form_pdf_export_modal.heading')}</h2>
          <p className="text-p2">{t('tax_form_pdf_export_modal.subheading')}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ol className="flex flex-col gap-6 [counter-reset:list-number-styling]">
            {actions.map((key, index) => (
              <li
                key={index}
                className="text-p1 flex [counter-increment:list-number-styling] before:mr-3 before:inline-flex before:h-8 before:w-8 before:shrink-0 before:items-center before:justify-center before:rounded-full before:border-2 before:border-gray-400 before:text-h-xs before:font-semibold before:text-gray-400 before:content-[counter(list-number-styling)] before:lg:mr-4 before:lg:h-8 before:lg:w-8"
              >
                <span>
                  <Trans
                    ns="forms"
                    i18nKey={key}
                    components={{ strong: <strong className="font-semibold" /> }}
                  />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <h3 className="text-h3">{t('tax_form_pdf_export_modal.how_to_pay_tax')}</h3>
        <p className="text-p1">
          <Trans
            ns="forms"
            i18nKey={
              isAuthenticated
                ? 'tax_form_pdf_export_modal.tax_assessed_statement_authenticated'
                : 'tax_form_pdf_export_modal.tax_assessed_statement'
            }
            components={{ strong: <strong className="font-semibold" /> }}
          />
        </p>
        {!isAuthenticated && (
          // Copied from RegistrationModal
          <>
            <div className="mt-3 flex w-full items-center md:mt-6">
              <span className="h-0.5 w-full bg-gray-200" />
              <span className="text-p1 px-6">{t('tax_form_pdf_export_modal.footer_choice')}</span>
              <span className="h-0.5 w-full bg-gray-200" />
            </div>
            <div>
              <div className="rounded-t-lg bg-main-100 p-4 md:px-6 md:py-5">
                <h4 className="text-h4">{t('tax_form_pdf_export_modal.account_create')}</h4>
                <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
                  {advantages.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <span className="flex h-5 w-5 min-w-[20px] items-center justify-center md:h-6 md:w-6 md:min-w-[24px]">
                        <CheckIcon className="h-7 w-7" />
                      </span>
                      <p className="text-p3 md:text-p1">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-b-lg bg-main-100 px-4 pb-4 md:px-0 md:pb-0">
                <AriaButton
                  className="text-p1-semibold flex w-full justify-center rounded-lg bg-main-700 px-5 py-2 text-center leading-6 text-gray-0 hover:bg-main-600 md:rounded-b-lg md:rounded-t-none md:px-0 md:py-6"
                  onPress={() => register()}
                >
                  {t('tax_form_pdf_export_modal.account_create_button')}
                </AriaButton>
              </div>
            </div>
          </>
        )}
        <div className="h-0.5 w-full bg-gray-200" />
        <h3 className="text-h3 text-center">{t('tax_form_pdf_export_modal.feedback_heading')}</h3>
        <ButtonNew
          variant="black-outline"
          className="min-w-[240px] self-center"
          href={taxFeedbackUrl}
          target="_blank"
        >
          {t('tax_form_pdf_export_modal.feedback_button')}
        </ButtonNew>
      </div>
    </div>
  )
}

/**
 * Rough version of the modal, some code is copied from RegistrationModal. It will need complex modal refactor in forms
 * in the future.
 */
const TaxFormPdfExportModal = ({ state, ...props }: TaxFormPdfExportModalProps) => (
  <ModalV2
    modalOverlayClassname="md:py-4"
    modalClassname="md:max-w-[800px] md:my-4 md:py-12 md:px-14"
    mobileFullScreen
    {...mergeProps(props, {
      onOpenChange: (isOpen) => {
        if (!isOpen && state?.type === 'loading') {
          state.onClose()
        }
      },
    } as ModalV2Props)}
  >
    {state?.type === 'loading' && <LoadingContent />}
    {state?.type === 'success' && <SuccessContent />}
  </ModalV2>
)

export default TaxFormPdfExportModal
