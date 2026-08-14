import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Controller } from 'react-hook-form'

import TextField from '@/src/components/fields/TextField'
import AccountErrorAlert from '@/src/components/segments/AccountErrorAlert/AccountErrorAlert'
import useHookForm from '@/src/frontend/hooks/useHookForm'

export interface PhoneNumberData {
  phone_number?: string
}

const schema = {
  type: 'object',
  properties: {
    phone_number: {
      type: 'string',
      format: 'phone',
      errorMessage: { format: 'auth.fields.phoneNumber.format' },
    },
  },
  required: ['phone_number'],
}

interface Props {
  error?: Error | null
  onHideError?: () => void
  onSubmit: ({ data }: { data?: PhoneNumberData }) => void
  defaultValues?: PhoneNumberData
}

const PhoneNumberForm = ({ error, onHideError, onSubmit, defaultValues }: Props) => {
  const { t } = useTranslation()

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<PhoneNumberData>({
    schema,
    defaultValues: { ...defaultValues },
  })

  return (
    <form
      className="flex w-full flex-col space-y-4"
      onSubmit={handleSubmit((data: PhoneNumberData) => onSubmit({ data }))}
    >
      <Typography variant="p-small">{t('PhoneNumberForm.description')}</Typography>
      <AccountErrorAlert error={error} close={onHideError} solid />
      <Controller
        name="phone_number"
        control={control}
        render={({ field }) => (
          <TextField
            label={t('PhoneNumberForm.phoneNumber')}
            helptext={t('PhoneNumberForm.phoneNumberHelptext')}
            autoComplete="tel"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.phone_number}
          />
        )}
      />
      <Button variant="solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {t('PhoneNumberForm.saveChangesButton')}
      </Button>
    </form>
  )
}

export default PhoneNumberForm
