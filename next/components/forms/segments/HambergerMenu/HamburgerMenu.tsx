import cx from 'classnames'
import { MenuItem } from 'components/forms/segments/AccountNavBar/AccountNavBar'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import { handleOnKeyPress } from '../../../../frontend/utils/general'

interface IProps {
  sectionsList?: MenuItem[]
  menuItems: MenuItem[]
  className?: string
  closeMenu: () => void
  onRouteChange: (selectedMenuItem: MenuItem) => void
}

const Divider = () => {
  return <div className="border-b-solid border-b-2 my-4" />
}

const Item = ({
  menuItem,
  isSelected,
  onClick,
}: {
  menuItem: MenuItem
  isSelected?: boolean
  onClick: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={(event) => handleOnKeyPress(event, onClick)}
      className={cx(
        ' text-p2-semibold rounded-lg p-4 flex items-center justify-between cursor-pointer border-b-2 border-transparent hover:text-main-700 hover:bg-main-100 transition-all',
        {
          'text-main-700 bg-main-100': isSelected,
        },
      )}
    >
      <div className="flex items-center gap-3">
        {menuItem.icon}
        <span>{t(menuItem?.title)}</span>
      </div>
      {menuItem.link === ROUTES.USER_PROFILE && <IdentityVerificationStatus />}
    </div>
  )
}

export const HamburgerMenu = ({
  sectionsList,
  menuItems,
  onRouteChange,
  className,
  closeMenu,
}: IProps) => {
  const router = useRouter()

  return (
    <div
      className={cx(
        'fixed top-16 left-0 bg-white w-screen overflow-y-scroll lg:hidden flex flex-col',
      )}
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <div className={cx('flex flex-col p-4', className)}>
        {sectionsList && (
          <>
            {sectionsList.map((sectionItem) => (
              <Link key={sectionItem.id} href={sectionItem.link}>
                <Item
                  menuItem={sectionItem}
                  isSelected={router.route.endsWith(sectionItem?.link)}
                  onClick={closeMenu}
                />
              </Link>
            ))}
            <Divider />
          </>
        )}
        {menuItems.map((sectionItem) => {
          if (sectionItem.link === '/logout') {
            return (
              <>
                <Divider />
                <Item
                  key={sectionItem.id}
                  menuItem={sectionItem}
                  onClick={() => {
                    onRouteChange(sectionItem)
                    closeMenu()
                  }}
                />
              </>
            )
          }
          return (
            <Link key={sectionItem.id} href={sectionItem.link}>
              <Item menuItem={sectionItem} onClick={closeMenu} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default HamburgerMenu
