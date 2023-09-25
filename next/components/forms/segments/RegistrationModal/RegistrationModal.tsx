import { ArrowRightIcon, CheckIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button as AriaButton } from 'react-aria-components'

import ButtonNew from '../../simple-components/ButtonNew'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

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
} & ModalV2Props

const RegistrationModal = ({ type, login, register, ...rest }: RegistrationModalBase) => {
  const { t } = useTranslation('forms')

  const { title, subtitle } = type
    ? {
        [RegistrationModalType.Initial]: {
          title: t('registration_modal.header_initial_title'),
          subtitle: t('registration_modal.header_initial_subtitle'),
        },
        [RegistrationModalType.NotAuthenticatedConceptSave]: {
          title: t('registration_modal.header_not_authenticated_concept_save_title'),
          subtitle: t('registration_modal.header_not_authenticated_concept_save_subtitle'),
        },
        [RegistrationModalType.NotAuthenticatedSubmitForm]: {
          title: t('registration_modal.header_not_verified_submit_form_title'),
          subtitle: t('registration_modal.header_not_verified_submit_form_subtitle'),
        },
      }[type]
    : { title: null, subtitle: null }

  const bodyListTranslation = t('registration_modal.body_list', { returnObjects: true })
  const bodyList = Array.isArray(bodyListTranslation) ? (bodyListTranslation as string[]) : []

  const close = () => {
    rest?.onOpenChange?.(false)
  }

  return (
    <ModalV2 modalClassname="md:max-w-[796px]" mobileFullScreen {...rest}>
      <div className="mb-6 flex flex-col gap-2">
        {title && <h3 className="text-h3">{title}</h3>}
        {subtitle && <p className="text-p1">{subtitle}</p>}
      </div>
      <div className="flex flex-col">
        <div className="rounded-t-lg bg-main-100 p-4 md:px-6 md:pb-6 md:pt-5">
          <h4 className="text-h4">{t('registration_modal.body_title')}</h4>
          <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            {bodyList.map((item, i) => (
              <li key={i} className="flex items-center gap-[18px]">
                <span className="flex h-5 w-5 min-w-[20px] items-center justify-center md:h-6 md:w-6 md:min-w-[24px]">
                  <CheckIcon className="h-7 w-7" />
                </span>
                <p className="text-p3 md:text-p1">{item}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-b-lg bg-main-100 px-4 pb-4 md:px-0 md:pb-0">
          {/* Use ButtonNew */}
          <AriaButton
            onPress={() => register()}
            className="text-p1-semibold flex w-full justify-center rounded-lg bg-main-700 px-5 py-2 text-center leading-6 text-gray-0 hover:bg-main-600  md:rounded-b-lg md:rounded-t-none md:px-0 md:py-6"
          >
            {t('registration_modal.body_action')}
          </AriaButton>
        </div>

        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0 md:mt-6">
          <span className="text-p1-semibold">{t('registration_modal.body_login_description')}</span>
          {/* Use ButtonNew */}
          <AriaButton
            onPress={() => login()}
            className="text-p1-semibold text-main-700 underline hover:text-main-600"
          >
            {t('registration_modal.body_login_link')}
          </AriaButton>
        </div>
      </div>
      {(type === RegistrationModalType.Initial ||
        type === RegistrationModalType.NotAuthenticatedSubmitForm) && (
        <div className="mb-4 flex flex-col gap-3 md:mb-0 md:gap-6">
          <div className="mt-3 flex items-center md:mt-6">
            <span className="h-0.5 w-full bg-gray-200" />
            <span className="text-p1 px-6">{t('registration_modal.footer_choice')}</span>
            <span className="h-0.5 w-full bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            {type === RegistrationModalType.Initial && (
              <>
                <ButtonNew
                  variant="black-outline"
                  endIcon={<ArrowRightIcon className="h-6 w-6" />}
                  onPress={close}
                  fullWidth
                >
                  {t('registration_modal.buttons_initial_continue_eid')}
                </ButtonNew>
                <ButtonNew
                  variant="black-outline"
                  endIcon={<ArrowRightIcon className="h-6 w-6" />}
                  onPress={close}
                  fullWidth
                >
                  {t('registration_modal.buttons_initial_skip')}
                </ButtonNew>
              </>
            )}
            {type === RegistrationModalType.NotAuthenticatedSubmitForm && (
              <>
                <ButtonNew variant="black-outline" onPress={close} fullWidth>
                  {t('registration_modal.buttons_not_verified_submit_back')}
                </ButtonNew>
                <ButtonNew
                  variant="black-outline"
                  endIcon={<ArrowRightIcon className="h-6 w-6" />}
                  onPress={close}
                  fullWidth
                >
                  {t('registration_modal.buttons_not_verified_submit_send')}
                </ButtonNew>
              </>
            )}
          </div>
        </div>
      )}
    </ModalV2>
  )
}

export default RegistrationModal
