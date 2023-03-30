import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import { ROUTES } from '@utils/constants'
import { AccountError } from '@utils/useAccount'
import useHookForm from '@utils/useHookForm'
import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter } from 'usehooks-ts'

interface Data {
  rc: string
  idCard: string
  turnstileToken: string
}

interface Props {
  onSubmit: (rc: string, idCard: string, turnstileToken: string) => void
  error?: AccountError | null | undefined
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    rc: {
      type: 'string',
      minLength: 1,
      format: 'rc',
      errorMessage: { minLength: 'account:rc_required', format: 'account:rc_format' },
    },
    idCard: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:id_card_required' },
    },
    turnstileToken: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['rc', 'idCard', 'turnstileToken'],
}

const IdentityVerificationForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation('account')
  const turnstileKeyCounter = useCounter()
  const router = useRouter()
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { rc: '', idCard: '' },
  })

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit((data: Data) => {
        // force turnstile rerender as it's always available just for a single request
        turnstileKeyCounter.increment()
        return onSubmit(data.rc, data.idCard, data.turnstileToken)
      })}
    >
      <h1 className="text-h3">{t('identity_verification_title')}</h1>
      <AccountErrorAlert error={error} />
      <Controller
        name="rc"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('rc_label')}
            placeholder={t('rc_placeholder')}
            tooltip={t('rc_tooltip')}
            tooltipPosition="bottom-left"
            {...field}
            errorMessage={errors.rc}
          />
        )}
      />
      <Controller
        name="idCard"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('id_card_label')}
            placeholder={t('id_card_placeholder')}
            helptext={t('id_card_description')}
            tooltip={t('id_card_tooltip')}
            tooltipPosition="bottom-left"
            {...field}
            errorMessage={errors.idCard}
          />
        )}
      />
      <Controller
        name="turnstileToken"
        control={control}
        render={({ field: { onChange } }) => (
          <Turnstile
            key={turnstileKeyCounter.count}
            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
            onVerify={(token) => onChange(token)}
            onError={() => onChange(null)}
            onTimeout={() => onChange(null)}
            onExpire={() => onChange(null)}
            className="mb-2"
          />
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('identity_verification_submit')}
        variant="category"
        loading={isSubmitting}
      />
      <Button
        variant="plain-black"
        className="min-w-full"
        onPress={() => router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })}
        text={t('identity_verification_skip')}
        endIcon={<ArrowRightIcon />}
      />
    </form>
  )
}

export default IdentityVerificationForm
