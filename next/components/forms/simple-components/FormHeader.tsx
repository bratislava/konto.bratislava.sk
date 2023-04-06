import DiskIcon from '@assets/images/forms/disk-icon.svg'
import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import Waves from 'components/forms/icon-components/Waves'
import Button from 'components/forms/simple-components/Button'
import FormMenu from 'components/forms/simple-components/FormMenu/FormMenu'
import Menu from 'components/forms/simple-components/Menu/Menu'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'
import { Item } from 'react-stately'

export interface MenuItem {
  id: number
  title: string
  icon: ReactNode
  link: string
  backgroundColor?: string // ex. bg-negative-700
}

const FormMenuItem = ({ menuItem }: { menuItem: MenuItem }) => {
  const { t } = useTranslation()

  return (
    <button type="button" tabIndex={1} className="cursor-pointer flex py-2 px-5">
      <div
        className={`flex relative flex-row items-start gap-2 rounded-xl p-4 ${
          menuItem.backgroundColor ?? 'bg-gray-50'
        }`}
      >
        <div className="flex h-2 w-2 items-center justify-center">
          <span>{menuItem.icon}</span>
        </div>
      </div>
      <div
        className="text-p2 hover:text-p2-semibold w-fit-title text-font p-2 whitespace-nowrap"
        title="sss"
      >
        sss11
      </div>
    </button>
  )
}

const FormHeader = () => {
  return (
    <div className="flex flex-col relative">
      <div className="w-full h-[68px] bg-main-200">
        <div className="max-w-screen-lg mx-auto h-full flex items-center">E-sluzby</div>
      </div>
      <div className="w-full h-full min-h-[120px] bg-main-200">
        <div className="justify-between max-w-screen-lg mx-auto pt-6 flex">
          <h1 className="text-h1">Záväzné stanovisko k investičnej činnosti</h1>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="category-outline"
              startIcon={<DiskIcon />}
              text="Uložiť ako koncept"
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
            />
            <Menu buttonIcon={<ThreePointsIcon />} label="">
              {[
                { id: 1, title: 'ss', icon: <ThreePointsIcon />, link: '/' },
                { id: 2, title: 'ss', icon: <ThreePointsIcon />, link: '/' },
              ].map((option) => (
                <Item key={option.id}>asdasdasd</Item>
              ))}
            </Menu>
            {/* <Button
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
              size="sm"
              variant="category-outline"
              icon={<ThreePointsIcon />}
            /> */}
          </div>
        </div>
      </div>
      <span className="overflow-hidden">
        <Waves className="mt-[-1px]" waveColor="rgb(var(--color-main-200))" />
      </span>
    </div>
  )
}

export default FormHeader
