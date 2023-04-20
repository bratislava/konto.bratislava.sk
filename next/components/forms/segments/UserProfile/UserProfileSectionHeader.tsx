import useAccount, { AccountStatus } from '@utils/useAccount'
import cx from 'classnames'
import Alert from 'components/forms/info-components/Alert'
import React from 'react'

interface UserProfileSectionHeaderProps {
  title: string
  text: string
  underline?: boolean
  isMobileColumn?: boolean
  isEditing?: boolean
  children?: React.ReactNode
  mainHeader?: boolean
}

const UserProfileSectionHeader = ({
  title,
  text,
  underline,
  isMobileColumn,
  isEditing,
  children,
  mainHeader,
}: UserProfileSectionHeaderProps) => {
  const { status } = useAccount()

  return (
    <div
      className={cx(
        'border-gray-200 p-4 flex flex-col gap-6',
        'md:flex-row md:flex-wrap md:px-8 md:py-6',
        {
          'border-b-2': underline,
          'flex-col': isMobileColumn,
          'flex-row': !isMobileColumn,
        },
      )}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col grow gap-2">
          <div className="flex items-center gap-3 md:gap-2">
            <h5 className={cx('text-h5-bold', 'md:text-h4-bold')}>{title}</h5>
            {mainHeader && status === AccountStatus.IdentityVerificationSuccess && (
              <span className="text-p3-medium px-2 bg-success-100 text-success-700 rounded-[4px]">
                Overený profil
              </span>
            )}
          </div>
          <p className={cx('text-p2-normal', 'md:block', { hidden: isEditing })}>{text}</p>
        </div>
        {children && <div>{children}</div>}
      </div>
      {mainHeader && status !== AccountStatus.IdentityVerificationSuccess && (
        <Alert
          message="Vaša identita zatiaľ nebola overená voči štátnym registrom. Bratislavské konto môžete preto používať len v obmedzenom režime, bez možnosti odoslať elektronicky všetky žiadosti či využiť službu online platby dane z nehnuteľností."
          type="warning"
          buttonsPosition="right"
          buttons={[
            {
              title: 'Overiť identitu',
              link: '/overenie-identity',
            },
          ]}
          fullWidth
        />
      )}
    </div>
  )
}

export default UserProfileSectionHeader
