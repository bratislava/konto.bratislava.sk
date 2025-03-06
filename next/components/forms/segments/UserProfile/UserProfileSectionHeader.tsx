import { useTranslation } from 'next-i18next'
import React from 'react'

import cn from '../../../../frontend/cn'
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
      className={cn(
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
        className={cn('flex w-full justify-between', {
          'flex-col items-start gap-4 md:flex-row md:items-center md:gap-0': childrenToColumn,
          'items-center': !childrenToColumn,
        })}
      >
        <div className="flex grow flex-col gap-1 md:gap-2">
          <div className="flex items-center gap-3 md:gap-2">
            <h2 className="text-h5-semibold md:text-h4-bold">{title}</h2>
            {mainHeader && tierStatus.isIdentityVerified && (
              <span className="rounded-[4px] bg-success-100 px-2 text-p3-medium text-success-700">
                {t('verification_status_success')}
              </span>
            )}
          </div>
          <p className={cn('text-p2-normal md:block', { hidden: isEditing })}>{text}</p>
        </div>
        {children && <div className={cn({ 'w-full md:w-fit': childrenToColumn })}>{children}</div>}
      </div>
    </div>
  )
}

export default UserProfileSectionHeader
