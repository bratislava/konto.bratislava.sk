import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import {
  SetDeliveryMethodPreferenceDtoDeliveryMethodEnum,
  UserOfficialCorrespondenceChannelEnum,
} from 'openapi-clients/city-account'
import { useEffect, useRef } from 'react'
import { Heading } from 'react-aria-components/Heading'
import { Controller } from 'react-hook-form'

import Radio from '@/src/components/fields/Radio'
import RadioGroup from '@/src/components/fields/RadioGroup'
import Markdown from '@/src/components/formatting/Markdown'
import OfficialCorrespondenceChannelAlert from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelAlert'
import { useStrapiTax } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import { useUserDataDeliveryMethod } from '@/src/components/page-contents/TaxesFees/useUserDataDeliveryMethod'
import Dialog from '@/src/components/simple-components/Dialog'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import useToast from '@/src/components/simple-components/Toast/useToast'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import { useDeliveryMethod } from '@/src/frontend/hooks/useUser'
import { isDefined } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

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

  useEffect(() => {
    checkScroll()
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={scrollRef}
      className="max-h-[200px] overflow-auto rounded-lg bg-gray-50 p-4 lg:p-8"
      onScroll={checkScroll}
    >
      <Markdown variant="small" content={agreementContent} />
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
      className="flex w-full flex-col gap-6"
      onSubmit={handleSubmit((data) => {
        return onSubmit({ data })
      })}
    >
      <Controller
        name="isSubscribed"
        control={control}
        render={({ field }) => (
          <RadioGroup
            isRequired
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
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <Typography as="span">
                  {t('taxes.delivery_method_change_modal.delivery_method_true.title')}
                </Typography>
                {/* TODO unify with Tag component */}
                <Typography
                  variant="p-tiny"
                  as="span"
                  className="rounded-sm bg-background-success-soft-default px-2 py-0.5 text-content-success-default"
                >
                  {t('taxes.delivery_method_change_modal.delivery_method_true.usage_percentage')}
                </Typography>
              </div>
            </Radio>
          </RadioGroup>
        )}
      />
      {isSubscribed && (
        <div className="flex flex-col gap-2">
          <Typography variant="p-small" className="font-semibold">
            {t('taxes.delivery_method_change_modal.delivery_method_true.agreement.title')}
          </Typography>
          <Controller
            name="scrolledToBottom"
            control={control}
            render={({ field }) => (
              <Agreement
                onScrollToBottom={() => field.onChange(true)}
                agreementContent={agreementContent}
              />
            )}
          />
        </div>
      )}
      <Button
        className="min-w-full"
        type="submit"
        variant="solid"
        isDisabled={isSubmitting || !isValid}
        isLoading={isSubmitting}
      >
        {t('taxes.delivery_method_change_modal.confirm_button_text')}
      </Button>
    </form>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20612-3394&m=dev
 */
// TODO Rewrite the radio group to actual values instead of true/false?
const OfficialCorrespondenceChannelChangeModal = ({ isOpen, onOpenChange }: ModalProps) => {
  const { t } = useTranslation('account')

  const { showToast } = useToast()

  const { deliveryMethod, hasChangedDeliveryMethodAfterDeadline } = useUserDataDeliveryMethod()
  const { changeDeliveryMethod } = useDeliveryMethod()

  const strapiTax = useStrapiTax()
  const { accountCommunicationConsentText } = strapiTax

  // EDESK users should not be able to change the delivery method. Modal shouls never be available to them, we return null in case.
  if (deliveryMethod === UserOfficialCorrespondenceChannelEnum.Edesk) {
    return null
  }

  const isSubscribedDefaultValue = isDefined(deliveryMethod)
    ? {
        [UserOfficialCorrespondenceChannelEnum.Email]: true,
        [UserOfficialCorrespondenceChannelEnum.Postal]: false,
      }[deliveryMethod]
    : undefined

  const handleSubmit = async ({ data }: { data: FormData }) => {
    return changeDeliveryMethod(
      data.isSubscribed
        ? SetDeliveryMethodPreferenceDtoDeliveryMethodEnum.CityAccount
        : SetDeliveryMethodPreferenceDtoDeliveryMethodEnum.Postal,
      {
        onSuccess: () => {
          onOpenChange?.(false)
          showToast({
            message: t('taxes.delivery_method_change_modal.success_snackbar_message'),
            variant: 'success',
          })
        },
        onError: (error) => {
          logger.error(error)
          showToast({
            message: t('taxes.delivery_method_change_modal.error_snackbar_message'),
            variant: 'error',
          })
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalOverlayClassname="md:py-4"
      modalClassname="md:max-w-[800px] md:my-4 md:py-12 md:px-14"
      mobileFullScreen
    >
      <Dialog>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Heading slot="title" className="text-size-h3-r font-semibold lg:text-size-h3">
              {t('taxes.delivery_method_change_modal.title')}
            </Heading>
            <Markdown
              variant="small"
              content={t('taxes.delivery_method_change_modal.description')}
            />
          </div>
          {hasChangedDeliveryMethodAfterDeadline && (
            <OfficialCorrespondenceChannelAlert
              variant="change-effective-next-year"
              strapiTax={strapiTax}
            />
          )}
          <Form
            defaultValues={{
              isSubscribed: isSubscribedDefaultValue,
              scrolledToBottom: false,
            }}
            onSubmit={handleSubmit}
            agreementContent={accountCommunicationConsentText}
          />
        </div>
      </Dialog>
    </Modal>
  )
}

export default OfficialCorrespondenceChannelChangeModal
