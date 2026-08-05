import { Button, Typography } from '@bratislava/component-library'
import { SendAllowedForUserResult } from 'forms-shared/send-policy/sendPolicy'
import { useTranslation } from 'next-i18next/pages'

import Markdown from '@/src/components/formatting/Markdown'
import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import AccountLink from '@/src/components/segments/AccountLink/AccountLink'
import Dialog from '@/src/components/simple-components/Dialog'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'

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
  const { t } = useTranslation('account')
  const {
    evaluatedSendPolicy: { sendAllowedForUserResult, eidSendPossible },
  } = useFormContext()

  const getTitleTranslation = () => {
    if (
      type === RegistrationModalType.Initial ||
      type === RegistrationModalType.NotAuthenticatedSubmitForm
    ) {
      if (eidSendPossible) {
        return t('RegistrationModal.header.initialTitleWithEid')
      }

      return t('RegistrationModal.header.initialTitleWithoutEid')
    }

    if (type === RegistrationModalType.NotAuthenticatedConceptSave) {
      return t('RegistrationModal.header.notAuthenticatedConceptSaveTitle')
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
          return t('RegistrationModal.header.initialSubtitleWithEidVerified')
        }
        if (onlyAuthenticationMissingType) {
          return t('RegistrationModal.header.initialSubtitleWithEidNotVerified')
        }
      } else {
        if (verificationMissingType) {
          return t('RegistrationModal.header.initialSubtitleWithoutEidVerified')
        }
        if (onlyAuthenticationMissingType) {
          return t('RegistrationModal.header.initialSubtitleWithoutEidNotVerified')
        }
      }
    }

    if (type === RegistrationModalType.NotAuthenticatedSubmitForm) {
      if (eidSendPossible) {
        if (verificationMissingType) {
          return t('RegistrationModal.header.notAuthenticatedSubmitSubtitleWithEidVerified')
        }
        if (onlyAuthenticationMissingType) {
          return t('RegistrationModal.header.notAuthenticatedSubmitSubtitleWithEidNotVerified')
        }
      } else {
        if (verificationMissingType) {
          return t('RegistrationModal.header.notAuthenticatedSubmitSubtitleWithoutEidVerified')
        }
        if (onlyAuthenticationMissingType) {
          return t('RegistrationModal.header.notAuthenticatedSubmitSubtitleWithoutEidNotVerified')
        }
      }
    }

    if (type === RegistrationModalType.NotAuthenticatedConceptSave) {
      return t('RegistrationModal.header.notAuthenticatedConceptSaveSubtitle')
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
    t('RegistrationModal.bodyList.0'),
    t('RegistrationModal.bodyList.1'),
    t('RegistrationModal.bodyList.2'),
    t('RegistrationModal.bodyList.3'),
    t('RegistrationModal.bodyList.4'),
  ]

  const close = () => {
    rest?.onOpenChange?.(false)
  }

  return (
    <Modal
      modalClassname="lg:max-w-[796px] lg:pt-8"
      mobileFullScreen
      {...rest}
      data-cy="registration-modal"
    >
      {/* Accessible title. */}
      <Dialog aria-label={t('RegisterForm.title')}>
        <div className="mb-6 flex flex-col gap-2">
          {title && <Typography variant="h3">{title}</Typography>}
          {subtitle && <Markdown variant="large" content={subtitle} />}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <div className="rounded-t-lg bg-gray-100 p-4 lg:px-6 lg:py-5">
              <Typography variant="h4">{t('RegistrationModal.bodyTitle')}</Typography>
              <ul className="mt-6 flex flex-col gap-2 lg:gap-4">
                {bodyList.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <span className="flex size-5 min-w-[20px] items-center justify-center lg:size-6 lg:min-w-[24px]">
                      <Icon name="check" className="size-7" />
                    </span>
                    <Typography variant="p-tiny" className="lg:text-size-p-large">
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-b-lg bg-gray-100 px-4 pb-4 lg:px-0 lg:pb-0">
              <Button
                variant="solid"
                fullWidth
                onPress={() => register()}
                className="lg:rounded-t-none lg:py-6"
                data-cy="registration-modal-button"
              >
                {t('RegistrationModal.bodyAction')}
              </Button>
            </div>
          </div>

          {/* Use the `login` function that saves draft and redirects to the login page and back to form after login */}
          <AccountLink variant="login" onLoginPress={login} />
        </div>
        {(type === RegistrationModalType.Initial ||
          type === RegistrationModalType.NotAuthenticatedSubmitForm) && (
          <div className="mb-4 flex flex-col gap-3 lg:mb-0 lg:gap-6">
            <div className="mt-3 flex items-center lg:mt-6">
              <span className="h-0.5 w-full bg-gray-200" />
              <span className="px-6 text-size-p-large-r lg:text-size-p-large">
                {t('RegistrationModal.footerChoice')}
              </span>
              <span className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              {type === RegistrationModalType.Initial && (
                <>
                  {eidSendPossible ? (
                    <Button variant="outline-soft" size="small" onPress={close} fullWidth>
                      {t('RegistrationModal.buttons.initialContinueEid')}
                    </Button>
                  ) : null}
                  <Button variant="outline-soft" size="small" onPress={close} fullWidth>
                    {t('RegistrationModal.buttons.initialSkip')}
                  </Button>
                </>
              )}
              {type === RegistrationModalType.NotAuthenticatedSubmitForm && (
                <>
                  <Button variant="outline-soft" size="small" onPress={close} fullWidth>
                    {t('RegistrationModal.buttons.notVerifiedSubmitBack')}
                  </Button>
                  <Button variant="outline-soft" size="small" onPress={close} fullWidth>
                    {t('RegistrationModal.buttons.notVerifiedSubmitSend')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </Modal>
  )
}

export default RegistrationModal
