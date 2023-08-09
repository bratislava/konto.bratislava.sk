import { ArrowRightIcon, CheckIcon } from '@assets/ui-icons'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type ButtonDesktopBase = {
  text: string
  endIcon?: ReactNode
  href?: string
}

const ButtonDesktop = ({ text, endIcon, href = '#' }: ButtonDesktopBase) => {
  return (
    <Link
      href={href}
      className="hidden w-full cursor-pointer justify-center gap-3 rounded-lg border-2 border-gray-200 bg-transparent py-2.5 text-gray-700 hover:border-gray-200 hover:text-gray-600 focus:border-gray-300 focus:text-gray-800 md:flex"
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

      <div className="text-p2-semibold ">{text}</div>
      <span className="flex h-6 w-6 items-center justify-center">{endIcon}</span>
    </Link>
  )
}

type ButtonMobileBase = {
  title: string
  text: string
  endIcon?: ReactNode
  href?: string
}

const ButtonMobile = ({ text, endIcon, href = '', title }: ButtonMobileBase) => {
  return (
    <Link
      href={href}
      className="flex w-full max-w-sm cursor-pointer flex-col gap-2 rounded-lg border-2 border-gray-200 bg-transparent p-4 text-gray-700 hover:border-gray-200 focus:border-gray-300 md:hidden"
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

      <div className="text-p2-semibold">{title}</div>
      <div className="flex items-center gap-2">
        <span className="text-p2-semibold text-main-700 hover:text-main-600">{text}</span>
        <span className="flex h-6 w-6 items-center justify-center text-main-700">{endIcon}</span>
      </div>
    </Link>
  )
}

export enum RegistrationModalType {
  Initial = 'Initial',
  NotAuthenticatedConceptSave = 'NotAuthenticatedConceptSave',
  NotVerifiedSubmitForm = 'NotVerifiedSubmitForm',
}

type RegistrationModalBase = {
  type: RegistrationModalType | null
  isBottomButtons?: boolean
} & ModalV2Props

const RegistrationModal = ({ type, isBottomButtons = true, ...rest }: RegistrationModalBase) => {
  const { t } = useTranslation('account')

  const { title, subtitle } = type
    ? {
        [RegistrationModalType.Initial]: {
          title: 'register_modal.header_sent_title',
          subtitle: 'register_modal.header_sent_subtitle',
        },
        [RegistrationModalType.NotAuthenticatedConceptSave]: {
          title: 'register_modal.header_sent_title',
          subtitle: 'register_modal.header_sent_subtitle',
        },
        [RegistrationModalType.NotVerifiedSubmitForm]: {
          title: 'register_modal.header_sent_title',
          subtitle: 'register_modal.header_sent_subtitle',
        },
      }[type]
    : { title: null, subtitle: null }

  const modalBodyList: string[] = [
    t('register_modal.body_list.1'),
    t('register_modal.body_list.2'),
    t('register_modal.body_list.3'),
    t('register_modal.body_list.4'),
    t('register_modal.body_list.5'),
  ]

  return (
    <ModalV2 {...rest}>
      <div className="mb-6 flex flex-col gap-2">
        {title && <h3 className="text-h3">{t(title)}</h3>}
        {subtitle && <p className="text-p1">{t(subtitle)}</p>}
      </div>
      <div className="flex flex-col">
        <div className="rounded-t-lg bg-main-100 p-4 md:px-6 md:pb-6 md:pt-5">
          <h4 className="text-h4">{t('register_modal.body_title')}</h4>
          <ul className="mt-6 flex flex-col gap-2 sm:gap-4">
            {modalBodyList.map((item, i) => (
              <li key={i} className="flex items-center gap-[18px]">
                <span className="flex h-5 w-5 min-w-[20px] items-center justify-center md:h-6 md:w-6 md:min-w-[24px]">
                  <CheckIcon className="h-7 w-7" />
                </span>
                <p className="text-p3 md:text-p1">{item}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-b-lg bg-main-100">
          <Link
            href={ROUTES.REGISTER}
            className="text-p1-semibold mx-4 mb-4 flex justify-center rounded-lg bg-main-700 px-5 py-2 text-center leading-6 text-gray-0 hover:bg-main-600 md:mx-0 md:mb-0 md:rounded-b-lg md:rounded-t-none md:px-0 md:py-6"
          >
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

            {t('register_modal.body_action')}
          </Link>
        </div>

        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0 md:mt-6">
          <span className="text-p1-semibold">{t('register_modal.body_login_description')}</span>
          <Link
            href={ROUTES.LOGIN}
            className="text-p1-semibold text-main-700 underline hover:text-main-600"
          >
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

            {t('register_modal.body_login_link')}
          </Link>
        </div>
      </div>
      {isBottomButtons && (
        <div className="mb-4 flex flex-col gap-3 md:mb-0 md:gap-6">
          <div className="mt-3 flex items-center md:mt-6">
            <span className="h-0.5 w-full bg-gray-200" />
            <span className="text-p1 px-6">{t('register_modal.footer_choice')}</span>
            <span className="h-0.5 w-full bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <ButtonDesktop
              text={t('register_modal.footer_desktop_button_eID_text')}
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
            />
            <ButtonDesktop
              text={t('register_modal.footer_desktop_button_app_text')}
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
            />
            <ButtonMobile
              title={t('register_modal.footer_mobile_button_eID_title')}
              text={t('register_modal.footer_mobile_button_eID_text')}
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
            />
            <ButtonMobile
              title={t('register_modal.footer_mobile_button_app_title')}
              text={t('register_modal.footer_mobile_button_app_text')}
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
            />
          </div>
        </div>
      )}
    </ModalV2>
  )
}

export default RegistrationModal
