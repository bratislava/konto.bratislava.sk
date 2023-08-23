import { useTranslation } from 'next-i18next'
import React, { useRef } from 'react'
import { Controller } from 'react-hook-form'

import useHookForm from '../../../../frontend/hooks/useHookForm'
import FieldErrorMessage from '../../info-components/FieldErrorMessage'
import ButtonNew from '../../simple-components/ButtonNew'
import { useFormSend } from '../../useFormSend'
import SingleCheckbox from '../../widget-components/Checkbox/SingleCheckbox'
import { useFormSummary } from './useFormSummary'

type AgreementForm = {
  agreement: boolean
}

const schema = {
  type: 'object',
  properties: {
    agreement: {
      type: 'boolean',
      const: true,
      errorMessage: { const: 'forms:summary.vop_agreement_required' },
    },
  },
  required: ['agreement'],
}

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const eIdButtonRef = useRef<HTMLButtonElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { submitDisabled } = useFormSummary()
  const { handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  const { handleSubmit, control, errors } = useHookForm<AgreementForm>({
    schema,
    defaultValues: { agreement: false },
  })
  return (
    <form
      // eslint-disable-next-line consistent-return
      onSubmit={handleSubmit((data, event) => {
        const { submitter } = event?.nativeEvent as SubmitEvent
        if (submitter === buttonRef.current) {
          return handleSendButtonPress(data.agreement)
        }
        if (submitter === eIdButtonRef.current) {
          return handleSendEidButtonPress(data.agreement)
        }
      })}
    >
      <h3 className="text-h3">{t('summary.vop_agreement_title')}</h3>
      <p>{t('summary.vop_agreement_content')}</p>

      <Controller
        name="agreement"
        control={control}
        render={({ field }) => (
          <>
            <SingleCheckbox {...field} error={Boolean(errors.agreement)}>
              {t('summary.vop_agreement_checkbox')}
            </SingleCheckbox>
            {errors.agreement && <FieldErrorMessage errorMessage={errors.agreement} />}
          </>
        )}
      />

      <ButtonNew isDisabled={submitDisabled} type="submit" variant="black-solid" ref={eIdButtonRef}>
        {t('summary.button_send_eid')}
      </ButtonNew>
      <ButtonNew isDisabled={submitDisabled} type="submit" variant="black-solid" ref={buttonRef}>
        {t('summary.button_send')}
      </ButtonNew>
    </form>
  )
}

export default SummaryFormControls
