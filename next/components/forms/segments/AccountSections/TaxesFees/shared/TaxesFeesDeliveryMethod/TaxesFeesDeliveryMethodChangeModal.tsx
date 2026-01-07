import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import TaxesChannelChangeEffectiveNextYearAlert from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesChannelChangeEffectiveNextYearAlert'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { useStrapiTax } from 'components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import Modal, { ModalProps } from 'components/forms/simple-components/Modal'
import Radio from 'components/forms/widget-components/RadioButton/Radio'
import RadioGroup from 'components/forms/widget-components/RadioButton/RadioGroup'
import useHookForm from 'frontend/hooks/useHookForm'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { useUserSubscription } from 'frontend/hooks/useUser'
import { isDefined } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { GDPRCategoryEnum, GDPRTypeEnum } from 'openapi-clients/city-account'
import React, { useEffect, useRef } from 'react'
import { Heading } from 'react-aria-components'
import { Controller } from 'react-hook-form'
import { useEffectOnce } from 'usehooks-ts'

type AgreementProps = {
  onScrollToBottom: () => void
  agreementContent: string
}

const Agreement = ({ onScrollToBottom, agreementContent }: AgreementProps) => {
  const scrollRef = useRef(null)

  const checkScroll = () => {
    if (!scrollRef.current) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    // https://stackoverflow.com/a/42860948
    if (scrollHeight - scrollTop - clientHeight < 1) {
      onScrollToBottom() // Emitting the event (calling the callback)
    }
  }

  useEffectOnce(() => {
    checkScroll()
  })

  return (
    <div
      ref={scrollRef}
      className="max-h-[200px] overflow-auto rounded-lg bg-gray-50 p-4 lg:p-8"
      onScroll={checkScroll}
    >
      <AccountMarkdown content={agreementContent} variant="sm" />
    </div>
  )
}

type FormData = {
  isSubscribed: boolean
  scrolledToBottom: boolean
}

const schema = {
  type: 'object',
  properties: {
    isSubscribed: {
      type: 'boolean',
    },
  },
  required: ['isSubscribed'],
  if: {
    properties: {
      isSubscribed: {
        const: true,
      },
    },
  },
  then: {
    properties: {
      scrolledToBottom: {
        type: 'boolean',
        const: true,
      },
    },
    required: ['scrolledToBottom'],
  },
}

interface FormProps {
  onSubmit: ({ data }: { data: FormData }) => void
  defaultValues: Partial<FormData>
  agreementContent: string
}

const Form = ({ onSubmit, defaultValues, agreementContent }: FormProps) => {
  const { t } = useTranslation('account')
  const {
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useHookForm<FormData>({
    schema,
    defaultValues,
  })

  const isSubscribed = watch('isSubscribed')

  useEffect(() => {
    if (!isSubscribed) {
      setValue('scrolledToBottom', false)
    }
  }, [isSubscribed, setValue])

  return (
    <form
      className="flex w-full flex-col space-y-4"
      onSubmit={handleSubmit((data) => {
        return onSubmit({ data })
      })}
    >
      <Controller
        name="isSubscribed"
        control={control}
        render={({ field }) => (
          <RadioGroup
            required
            onChange={(value) => field.onChange(value === 'true')}
            value={isDefined(field.value) ? String(field.value) : undefined}
            label={t('taxes.delivery_method_change_modal.delivery_method_label')}
            orientation="vertical"
          >
            <Radio
              value="false"
              variant="boxed"
              description={t(
                'taxes.delivery_method_change_modal.delivery_method_false.description',
              )}
            >
              {t('taxes.delivery_method_change_modal.delivery_method_false.title')}
            </Radio>
            <Radio
              value="true"
              variant="boxed"
              description={t('taxes.delivery_method_change_modal.delivery_method_true.description')}
            >
              {t('taxes.delivery_method_change_modal.delivery_method_true.title')}
            </Radio>
          </RadioGroup>
        )}
      />
      {isSubscribed && (
        <Controller
          name="scrolledToBottom"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-4">
              <Agreement
                onScrollToBottom={() => field.onChange(true)}
                agreementContent={agreementContent}
              />
              <p className="text-p2">{t('taxes.delivery_method_change_modal.agreement_text')}</p>
            </div>
          )}
        />
      )}
      <ButtonNew
        className="min-w-full"
        type="submit"
        variant="black-solid"
        isDisabled={isSubmitting || !isValid}
        isLoading={isSubmitting}
      >
        {t('taxes.delivery_method_change_modal.confirm_button_text')}
      </ButtonNew>
    </form>
  )
}

const TaxesFeesDeliveryMethodChangeModal = ({ isOpen, onOpenChange }: ModalProps) => {
  const { isSubscribed, changeSubscription, subType } = useUserSubscription({
    category: GDPRCategoryEnum.Taxes,
    type: GDPRTypeEnum.FormalCommunication,
  })
  const { t } = useTranslation('account')

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const { isChannelChangeEffectiveNextYear } = useOfficialCorrespondenceChannel()

  const strapiTax = useStrapiTax()
  const { accountCommunicationConsentText } = strapiTax

  const handleSubmit = async ({ data }: { data: FormData }) => {
    return changeSubscription(data.isSubscribed, {
      onSuccess: () => {
        onOpenChange?.(false)
        openSnackbarSuccess(t('taxes.delivery_method_change_modal.success_snackbar_message'))
      },
      onError: (error) => {
        logger.error(error)
        openSnackbarError(t('taxes.delivery_method_change_modal.error_snackbar_message'))
      },
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalOverlayClassname="md:py-4"
      modalClassname="md:max-w-[800px] md:my-4 md:py-12 md:px-14"
      mobileFullScreen
    >
      <Heading slot="title" className="mb-2 text-h3">
        {t('taxes.delivery_method_change_modal.title')}
      </Heading>
      <AccountMarkdown
        content={t('taxes.delivery_method_change_modal.description')}
        variant="sm"
        className="mb-4"
      />
      {isChannelChangeEffectiveNextYear && (
        <div className="mb-4">
          <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
        </div>
      )}
      <Form
        defaultValues={{
          isSubscribed: subType ? isSubscribed : undefined,
          scrolledToBottom: false,
        }}
        onSubmit={handleSubmit}
        agreementContent={accountCommunicationConsentText}
      />
    </Modal>
  )
}

export default TaxesFeesDeliveryMethodChangeModal
