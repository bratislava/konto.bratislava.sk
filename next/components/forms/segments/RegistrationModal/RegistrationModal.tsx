import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import CheckIcon from '@assets/images/new-icons/ui/done.svg'
import cx from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import { handleOnKeyPress } from '../../../../frontend/utils/general'

type ButtonDesktopBase = {
  text: string
  endIcon?: ReactNode
  href?: string
}

const ButtonDesktop = ({ text, endIcon, href = '#' }: ButtonDesktopBase) => {
  return (
    <Link
      href={href}
      className="cursor-pointer w-full hidden md:flex justify-center gap-3 py-2.5 border-2 border-gray-200 bg-transparent text-gray-700 focus:border-gray-300 focus:text-gray-800 hover:border-gray-200 hover:text-gray-600 rounded-lg"
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

      <div className="text-p2-semibold ">{text}</div>
      <span className="w-6 h-6 flex justify-center items-center">{endIcon}</span>
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
      className="cursor-pointer w-full max-w-sm flex flex-col md:hidden gap-2 p-4 border-2 border-gray-200 bg-transparent text-gray-700 focus:border-gray-300 hover:border-gray-200 rounded-lg"
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

      <div className="text-p2-semibold">{title}</div>
      <div className="flex items-center gap-2">
        <span className="text-p2-semibold text-main-700 hover:text-main-600">{text}</span>
        <span className="w-6 h-6 flex justify-center items-center text-main-700">{endIcon}</span>
      </div>
    </Link>
  )
}

type RegistrationModalBase = {
  title: string
  subtitle: string
  show: boolean
  onClose: () => void
  className?: string
  isBottomButtons?: boolean
}

const RegistrationModal = ({
  title,
  subtitle,
  show,
  onClose,
  className,
  isBottomButtons = true,
}: RegistrationModalBase) => {
  const { t } = useTranslation('account')

  const modalBodyList: string[] = [
    t('register_modal.body_list.1'),
    t('register_modal.body_list.2'),
    t('register_modal.body_list.3'),
    t('register_modal.body_list.4'),
    t('register_modal.body_list.5'),
  ]

  if (!show) {
    return null
  }
  return (
    <div
      role="button"
      tabIndex={0}
      className="h-full fixed w-full z-50 inset-0 flex items-center justify-center"
      style={{ background: 'rgba(var(--color-gray-800), .4)', marginTop: '0' }}
      onClick={onClose}
      onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, onClose)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={(event: React.KeyboardEvent) =>
          handleOnKeyPress(event, () => event.stopPropagation())
        }
        className={cx(
          'md:h-min w-full max-w-none h-full md:max-w-[796px] rounded-none md:rounded-2xl bg-gray-0 px-4 md:px-6 pt-12 md:py-8 relative mx-0 md:mx-4 overflow-auto',
          className,
        )}
      >
        <div className="flex flex-col gap-2 mb-6">
          <CloseIcon
            onClick={onClose}
            className="cursor-pointer w-6 h-6 absolute top-3 right-3 md:top-4 md:right-6"
          />
          <h3 className="text-h3">{title}</h3>
          <p className="text-p1">{subtitle}</p>
        </div>
        <div className="flex flex-col">
          <div className="p-4 md:px-6 bg-main-100 md:pt-5 md:pb-6 rounded-t-lg">
            <h4 className="text-h4">{t('register_modal.body_title')}</h4>
            <ul className="flex flex-col gap-2 sm:gap-4 mt-6">
              {modalBodyList.map((item, i) => (
                <li key={i} className="flex gap-[18px] items-center">
                  <span className="min-w-[20px] md:min-w-[24px] w-5 h-5 md:w-6 md:h-6 flex justify-center items-center">
                    <CheckIcon className="w-7 h-7" />
                  </span>
                  <p className="text-p3 md:text-p1">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-main-100 rounded-b-lg">
            <Link
              href={ROUTES.REGISTER}
              className="text-p1-semibold text-gray-0 leading-6 text-center bg-main-700 py-2 md:py-6 mb-4 md:mb-0 mx-4 md:mx-0 px-5 md:px-0 rounded-lg md:rounded-t-none md:rounded-b-lg flex justify-center hover:bg-main-600"
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

              {t('register_modal.body_action')}
            </Link>
          </div>

          <div className="flex flex-col gap-1 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mt-3 md:mt-6">
            <span className="text-p1-semibold">{t('register_modal.body_login_description')}</span>
            <Link
              href={ROUTES.LOGIN}
              className="text-p1-semibold underline text-main-700 hover:text-main-600"
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

              {t('register_modal.body_login_link')}
            </Link>
          </div>
        </div>
        {isBottomButtons && (
          <div className="flex flex-col gap-3 mb-4 md:mb-0 md:gap-6">
            <div className="flex items-center mt-3 md:mt-6">
              <span className="w-full h-0.5 bg-gray-200" />
              <span className="text-p1 px-6">{t('register_modal.footer_choice')}</span>
              <span className="w-full h-0.5 bg-gray-200" />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
              <ButtonDesktop
                text={t('register_modal.footer_desktop_button_eID_text')}
                endIcon={<ArrowRightIcon className="w-6 h-6" />}
              />
              <ButtonDesktop
                text={t('register_modal.footer_desktop_button_app_text')}
                endIcon={<ArrowRightIcon className="w-6 h-6" />}
              />
              <ButtonMobile
                title={t('register_modal.footer_mobile_button_eID_title')}
                text={t('register_modal.footer_mobile_button_eID_text')}
                endIcon={<ArrowRightIcon className="w-6 h-6" />}
              />
              <ButtonMobile
                title={t('register_modal.footer_mobile_button_app_title')}
                text={t('register_modal.footer_mobile_button_app_text')}
                endIcon={<ArrowRightIcon className="w-6 h-6" />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistrationModal
