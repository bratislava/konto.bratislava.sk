import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'

interface UserProfileSectionHeaderProps {
  title: string
  text: string
  underline?: boolean
  isMobileColumn?: boolean
  isEditing?: boolean
  children?: React.ReactNode
  mainHeader?: boolean
  childrenToColumn?: boolean
}

const UserProfileSectionHeader = ({
  title,
  text,
  underline,
  isMobileColumn,
  isEditing,
  children,
  mainHeader,
  childrenToColumn,
}: UserProfileSectionHeaderProps) => {
  const { tierStatus } = useSsrAuth()
  const { t } = useTranslation('account')

  return (
    <div
      className={cx(
        'flex flex-col gap-6 border-gray-200 p-4',
        'md:flex-row md:flex-wrap md:px-8 md:py-6',
        {
          'border-b-2': underline,
          'flex-col': isMobileColumn,
          'flex-row': !isMobileColumn,
        },
      )}
    >
      <div
        className={cx('flex w-full justify-between', {
          'flex-col items-start gap-4 md:flex-row md:items-center md:gap-0': childrenToColumn,
          'items-center': !childrenToColumn,
        })}
      >
        <div className="flex grow flex-col gap-1 md:gap-2">
          <div className="flex items-center gap-3 md:gap-2">
            <h2 className={cx('text-h5-bold', 'md:text-h4-bold')}>{title}</h2>
            {mainHeader && tierStatus.isIdentityVerified && (
              <span className="text-p3-medium bg-success-100 text-success-700 rounded-[4px] px-2">
                {t('verification_status_success')}
              </span>
            )}
          </div>
          <p className={cx('text-p2-normal', 'md:block', { hidden: isEditing })}>{text}</p>
        </div>
        {children && <div className={cx({ 'w-full md:w-fit': childrenToColumn })}>{children}</div>}
      </div>
    </div>
  )
}

export default UserProfileSectionHeader
