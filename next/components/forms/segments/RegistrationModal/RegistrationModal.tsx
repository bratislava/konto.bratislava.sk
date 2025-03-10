import { ArrowRightIcon, CheckIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button as AriaButton } from 'react-aria-components'

import ButtonNew from '../../simple-components/ButtonNew'
import Modal, { ModalProps } from '../../simple-components/Modal'
import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'

export enum RegistrationModalType {
  Initial = 'Initial',
  NotAuthenticatedConceptSave = 'NotAuthenticatedConceptSave',
  NotAuthenticatedSubmitForm = 'NotAuthenticatedSubmitForm',
}
type ButtonWithSubtextProps = {
  text: string
  subtext: string
  onPress: () => void
}

const ButtonWithSubtext = ({ text, subtext, onPress }: ButtonWithSubtextProps) => {
  return (
    <ButtonNew
      variant="black-outline"
      className="justify-start p-4 md:justify-center md:px-4 md:py-3"
      endIcon={<ArrowRightIcon className="hidden size-6 md:block" />}
      onPress={onPress}
      fullWidth
    >
      <div className="flex flex-col gap-2 text-left md:text-center">
        <div className="md:hidden">{text}</div>
        <div className="inline-flex gap-2 text-main-700 md:text-gray-700">
          {subtext}
          <ArrowRightIcon className="block size-6 md:hidden" />
        </div>
      </div>
    </ButtonNew>
  )
}

type RegistrationModalBase = {
  type: RegistrationModalType | null
  // register and log in action may depend upon context - when called from inside the form it involves saving work in progress
  register: () => void
  login: () => void
} & ModalProps

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
      <div className="flex flex-col">
        <div className="rounded-t-lg bg-main-100 p-4 md:px-6 md:py-5">
          <h4 className="text-h4">{t('registration_modal.body_title')}</h4>
          <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            {bodyList.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <span className="flex size-5 min-w-[20px] items-center justify-center md:size-6 md:min-w-[24px]">
                  <CheckIcon className="size-7" />
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
            className="flex w-full justify-center rounded-lg bg-main-700 px-5 py-2 text-center text-p1-semibold leading-6 text-gray-0 hover:bg-main-600 md:rounded-t-none md:rounded-b-lg md:px-0 md:py-6"
            data-cy="registration-modal-button"
          >
            {t('registration_modal.body_action')}
          </AriaButton>
        </div>

        <div className="mt-3 flex flex-col gap-1 md:mt-6 md:flex-row md:items-center md:justify-between md:gap-0">
          <span className="text-p1-semibold">{t('registration_modal.body_login_description')}</span>
          {/* Use ButtonNew */}
          <AriaButton
            onPress={() => login()}
            className="text-left text-p1 text-main-700 underline hover:text-main-600 md:text-center"
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
            <span className="px-6 text-p1">{t('registration_modal.footer_choice')}</span>
            <span className="h-0.5 w-full bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            {type === RegistrationModalType.Initial && (
              <>
                <ButtonWithSubtext
                  text={t('registration_modal.buttons_initial_continue_eid_title')}
                  subtext={t('registration_modal.buttons_initial_continue_eid')}
                  onPress={close}
                />
                <ButtonWithSubtext
                  text={t('registration_modal.buttons_initial_skip_title')}
                  subtext={t('registration_modal.buttons_initial_skip')}
                  onPress={close}
                />
              </>
            )}
            {type === RegistrationModalType.NotAuthenticatedSubmitForm && (
              <>
                <ButtonNew variant="black-outline" onPress={close} fullWidth>
                  {t('registration_modal.buttons_not_verified_submit_back')}
                </ButtonNew>
                <ButtonNew
                  variant="black-outline"
                  endIcon={<ArrowRightIcon className="size-6" />}
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
    </Modal>
  )
}

export default RegistrationModal
