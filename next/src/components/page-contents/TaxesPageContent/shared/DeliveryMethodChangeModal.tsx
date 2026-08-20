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
import DeliveryMethodAlert from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodAlert'
import { useStrapiTaxConfig } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import Dialog from '@/src/components/simple-components/Dialog'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import useToast from '@/src/components/simple-components/Toast/useToast'
import {
  useChangeDeliveryMethod,
  useGetDeliveryMethod,
} from '@/src/frontend/hooks/useDeliveryMethod'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import { isDefined } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Props = {
  onScrollToBottom: () => void
  agreementContent: string
}

const Agreement = ({ onScrollToBottom, agreementContent }: Props) => {
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
  const { t } = useTranslation()

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
      noValidate // We use AJV validation
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
            label={t('DeliveryMethodChangeModal.deliveryMethodLabel')}
            orientation="vertical"
          >
            <Radio
              value="false"
              variant="boxed"
              description={t('DeliveryMethodChangeModal.deliveryMethodFalse.description')}
            >
              <Typography as="span">
                {t('DeliveryMethodChangeModal.deliveryMethodFalse.title')}
              </Typography>
            </Radio>
            <Radio
              value="true"
              variant="boxed"
              description={t('DeliveryMethodChangeModal.deliveryMethodTrue.description')}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <Typography as="span">
                  {t('DeliveryMethodChangeModal.deliveryMethodTrue.title')}
                </Typography>
                {/* TODO unify with Tag component */}
                <Typography
                  variant="p-tiny"
                  as="span"
                  className="rounded-sm bg-background-success-soft-default px-2 py-0.5 text-content-success-default"
                >
                  {t('DeliveryMethodChangeModal.deliveryMethodTrue.usagePercentage')}
                </Typography>
              </div>
            </Radio>
          </RadioGroup>
        )}
      />
      {isSubscribed && (
        <div className="flex flex-col gap-2">
          <Typography variant="p-small" className="font-semibold">
            {t('DeliveryMethodChangeModal.deliveryMethodTrue.agreement.title')}
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
        {t('DeliveryMethodChangeModal.confirmButtonText')}
      </Button>
    </form>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20612-3394&m=dev
 *
 * TODO Rewrite the radio group to actual values instead of true/false?
 */
const DeliveryMethodChangeModal = ({ isOpen, onOpenChange }: ModalProps) => {
  const { t } = useTranslation()

  const { showToast } = useToast()

  const { deliveryMethod, hasUserChangedDeliveryMethodAfterDeadline } = useGetDeliveryMethod()
  const { changeDeliveryMethod } = useChangeDeliveryMethod()

  const strapiTaxConfig = useStrapiTaxConfig()

  // EDESK users should not be able to change the delivery method.
  // Modal should never be available to them, we return null in case.
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
            message: t('DeliveryMethodChangeModal.successSnackbarMessage'),
            variant: 'success',
          })
        },
        onError: (error) => {
          logger.error(error)
          showToast({
            message: t('DeliveryMethodChangeModal.errorSnackbarMessage'),
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
      modalOverlayClassname="lg:py-4"
      modalClassname="lg:max-w-[800px] lg:my-4 lg:py-12 lg:px-14"
      mobileFullScreen
    >
      <Dialog>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Heading slot="title" className="text-size-h3-r font-semibold lg:text-size-h3">
              {t('DeliveryMethodChangeModal.title')}
            </Heading>
            <Markdown variant="small" content={t('DeliveryMethodChangeModal.description')} />
          </div>
          {hasUserChangedDeliveryMethodAfterDeadline && (
            <DeliveryMethodAlert variant="change-effective-next-year" />
          )}
          <Form
            defaultValues={{
              isSubscribed: isSubscribedDefaultValue,
              scrolledToBottom: false,
            }}
            onSubmit={handleSubmit}
            agreementContent={strapiTaxConfig.deliveryMethod.consentText}
          />
        </div>
      </Dialog>
    </Modal>
  )
}

export default DeliveryMethodChangeModal
