import { useTranslation } from 'next-i18next'
import { GdprDataDtoCategoryEnum, GdprDataDtoTypeEnum } from 'openapi-clients/city-account'
import React, { useEffect, useRef } from 'react'
import { Heading } from 'react-aria-components'
import { Controller } from 'react-hook-form'
import { useEffectOnce } from 'usehooks-ts'

import useHookForm from '../../../../../frontend/hooks/useHookForm'
import useSnackbar from '../../../../../frontend/hooks/useSnackbar'
import { useUserSubscription } from '../../../../../frontend/hooks/useUser'
import logger from '../../../../../frontend/utils/logger'
import ButtonNew from '../../../simple-components/ButtonNew'
import Modal, { ModalProps } from '../../../simple-components/Modal'
import Radio from '../../../widget-components/RadioButton/Radio'
import RadioGroup from '../../../widget-components/RadioButton/RadioGroup'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

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
            value={field.value === undefined ? undefined : field.value ? 'true' : 'false'}
            label={t('delivery_method_change_modal_label')}
            orientation="vertical"
          >
            <Radio
              value="true"
              variant="boxed"
              description={t('delivery_method_change_modal_description_true')}
            >
              {t('delivery_method_change_modal_description_true_title')}
            </Radio>
            <Radio
              value="false"
              variant="boxed"
              description={t('delivery_method_change_modal_description_false')}
            >
              {t('delivery_method_change_modal_description_false_title')}
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
              <p className="text-p2">{t('delivery_method_change_modal_agreement_text')}</p>
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
        {t('delivery_method_change_modal_button_text')}
      </ButtonNew>
    </form>
  )
}

type TaxesFeesDeliveryMethodChangeModalProps = ModalProps & {
  agreementContent: string
}

const TaxesFeesDeliveryMethodChangeModal = ({
  isOpen,
  onOpenChange,
  agreementContent,
}: TaxesFeesDeliveryMethodChangeModalProps) => {
  const { isSubscribed, isSubscribtionExists, changeSubscription } = useUserSubscription({
    category: GdprDataDtoCategoryEnum.Taxes,
    type: GdprDataDtoTypeEnum.FormalCommunication,
  })
  const { t } = useTranslation('account')
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const handleSubmit = async ({ data }: { data: FormData }) => {
    return changeSubscription(data.isSubscribed, {
      onSuccess: () => {
        onOpenChange?.(false)
        openSnackbarSuccess(t('delivery_method_change_success'))
      },
      onError: (error) => {
        logger.error(error)
        openSnackbarError(t('delivery_method_change_error'))
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
        {t('delivery_method_change_modal_title')}
      </Heading>
      <Form
        defaultValues={{
          isSubscribed: isSubscribtionExists ? isSubscribed : undefined,
          scrolledToBottom: false,
        }}
        onSubmit={handleSubmit}
        agreementContent={agreementContent}
      />
    </Modal>
  )
}

export default TaxesFeesDeliveryMethodChangeModal
