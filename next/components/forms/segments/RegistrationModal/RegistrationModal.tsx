import { SendAllowedForUserResult } from 'forms-shared/send-policy/sendPolicy'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { CheckIcon } from '@/assets/ui-icons'
import AccountLink from '@/components/forms/segments/AccountLink/AccountLink'
import AccountMarkdown from '@/components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from '@/components/forms/simple-components/Button'
import Modal, { ModalProps } from '@/components/forms/simple-components/Modal'
import { useFormContext } from '@/components/forms/useFormContext'

export enum RegistrationModalType {
  Initial = 'Initial',
  NotAuthenticatedConceptSave = 'NotAuthenticatedConceptSave',
  NotAuthenticatedSubmitForm = 'NotAuthenticatedSubmitForm',
}

type RegistrationModalBase = {
  type: RegistrationModalType | null
  // register and log in action may depend upon context - when called from inside the form it involves saving work in progress
  register: () => void
  login: () => void
} & ModalProps

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10993-2968&t=nvTJpHb34NMAiOw5-4
 */

const RegistrationModal = ({ type, login, register, ...rest }: RegistrationModalBase) => {
  const { t } = useTranslation('forms')
  const {
    evaluatedSendPolicy: { sendAllowedForUserResult, eidSendPossible },
  } = useFormContext()

  const getTitleTranslation = () => {
    if (
      type === RegistrationModalType.Initial ||
      type === RegistrationModalType.NotAuthenticatedSubmitForm
    ) {
      if (eidSendPossible) {
        return t('registration_modal.header_initial_title_with_eid')
      }

      return t('registration_modal.header_initial_title_without_eid')
    }

    if (type === RegistrationModalType.NotAuthenticatedConceptSave) {
      return t('registration_modal.header_not_authenticated_concept_save_title')
    }

    return ''
  }

  const getSubtitleTranslation = () => {
    const verificationMissingType =
      sendAllowedForUserResult === SendAllowedForUserResult.VerificationMissing ||
      sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationAndVerificationMissing
    const onlyAuthenticationMissingType =
      sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationMissing

    if (type === RegistrationModalType.Initial) {
      if (eidSendPossible) {
        if (verificationMissingType) {
          return t('registration_modal.header_initial_subtitle_with_eid_verified')
        }
        if (onlyAuthenticationMissingType) {
          return t('registration_modal.header_initial_subtitle_with_eid_not_verified')
        }
      } else {
        if (verificationMissingType) {
          return t('registration_modal.header_initial_subtitle_without_eid_verified')
        }
        if (onlyAuthenticationMissingType) {
          return t('registration_modal.header_initial_subtitle_without_eid_not_verified')
        }
      }
    }

    if (type === RegistrationModalType.NotAuthenticatedSubmitForm) {
      if (eidSendPossible) {
        if (verificationMissingType) {
          return t('registration_modal.header_not_authenticated_submit_subtitle_with_eid_verified')
        }
        if (onlyAuthenticationMissingType) {
          return t(
            'registration_modal.header_not_authenticated_submit_subtitle_with_eid_not_verified',
          )
        }
      } else {
        if (verificationMissingType) {
          return t(
            'registration_modal.header_not_authenticated_submit_subtitle_without_eid_verified',
          )
        }
        if (onlyAuthenticationMissingType) {
          return t(
            'registration_modal.header_not_authenticated_submit_subtitle_without_eid_not_verified',
          )
        }
      }
    }

    if (type === RegistrationModalType.NotAuthenticatedConceptSave) {
      return t('registration_modal.header_not_authenticated_concept_save_subtitle')
    }

    return ''
  }

  const { title, subtitle } = type
    ? {
        title: getTitleTranslation(),
        subtitle: getSubtitleTranslation(),
      }
    : { title: null, subtitle: null }

  const bodyList = [
    t('registration_modal.body_list.0'),
    t('registration_modal.body_list.1'),
    t('registration_modal.body_list.2'),
    t('registration_modal.body_list.3'),
    t('registration_modal.body_list.4'),
  ]

  const close = () => {
    rest?.onOpenChange?.(false)
  }

  return (
    <Modal
      modalClassname="md:max-w-[796px] md:pt-8"
      mobileFullScreen
      {...rest}
      data-cy="registration-modal"
    >
      <div className="mb-6 flex flex-col gap-2">
        {title && <h3 className="text-h2 lg:text-h3">{title}</h3>}
        {subtitle && <AccountMarkdown className="text-p1" content={subtitle} />}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <div className="rounded-t-lg bg-gray-100 p-4 md:px-6 md:py-5">
            <h4 className="text-h4">{t('registration_modal.body_title')}</h4>
            <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
              {bodyList.map((item, index) => (
                <li key={index} className="flex items-center gap-4">
                  <span className="flex size-5 min-w-[20px] items-center justify-center md:size-6 md:min-w-[24px]">
                    <CheckIcon className="size-7" />
                  </span>
                  <p className="text-p3 md:text-p1">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-b-lg bg-gray-100 px-4 pb-4 md:px-0 md:pb-0">
            <Button
              variant="solid"
              fullWidth
              onPress={() => register()}
              className="rounded-lg px-5 py-2 text-p1-semibold leading-6 md:rounded-t-none lg:rounded-b-lg lg:px-0 lg:py-6"
              data-cy="registration-modal-button"
            >
              {t('registration_modal.body_action')}
            </Button>
          </div>
        </div>

        <AccountLink variant="login" />
      </div>
      {(type === RegistrationModalType.Initial ||
        type === RegistrationModalType.NotAuthenticatedSubmitForm) && (
        <div className="mb-4 flex flex-col gap-3 md:mb-0 md:gap-6">
          <div className="mt-3 flex items-center md:mt-6">
            <span className="h-0.5 w-full bg-gray-200" />
            <span className="px-6 text-p1">{t('registration_modal.footer_choice')}</span>
            <span className="h-0.5 w-full bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            {type === RegistrationModalType.Initial && (
              <>
                {eidSendPossible ? (
                  <Button variant="outline" onPress={close} fullWidth>
                    {t('registration_modal.buttons_initial_continue_eid')}
                  </Button>
                ) : null}
                <Button variant="outline" onPress={close} fullWidth>
                  {t('registration_modal.buttons_initial_skip')}
                </Button>
              </>
            )}
            {type === RegistrationModalType.NotAuthenticatedSubmitForm && (
              <>
                <Button variant="outline" onPress={close} fullWidth>
                  {t('registration_modal.buttons_not_verified_submit_back')}
                </Button>
                <Button variant="outline" onPress={close} fullWidth>
                  {t('registration_modal.buttons_not_verified_submit_send')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default RegistrationModal
