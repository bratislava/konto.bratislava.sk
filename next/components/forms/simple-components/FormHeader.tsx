import DiskIcon from '@assets/images/forms/disk-icon.svg'
import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import ArrowsDownUpIcon from '@assets/images/new-icons/ui/arrows-down-up.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import LockIcon from '@assets/images/new-icons/ui/lock.svg'
import PdfIcon from '@assets/images/new-icons/ui/pdf.svg'
import Waves from 'components/forms/icon-components/Waves'
import Button from 'components/forms/simple-components/Button'
import FormMenu from 'components/forms/simple-components/FormMenu/FormMenu'
import FormMenuButton from 'components/forms/simple-components/FormMenu/FormMenuButton'
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

type FormHeaderMenuContentBase = {
  title: string
  icon: ReactNode
  key: string
}

const formHeaderMenuContent: FormHeaderMenuContentBase[] = [
  { title: 'Vyplniť cez eID', icon: <LockIcon />, key: 'eID' },
  { title: 'Stiahnuť ako XML', icon: <DownloadIcon />, key: 'xmlDownload' },
  { title: 'Stiahnuť ako PDF', icon: <PdfIcon />, key: 'pdf' },
  { title: 'Nahrať z XML', icon: <ArrowsDownUpIcon />, key: 'xmlUpload' },
]

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
            <FormMenuButton shouldFlip closeOnSelect={false} items={formHeaderMenuContent}>
              {(item: FormHeaderMenuContentBase) => (
                <Item>
                  <div className="font-sans flex items-center gap-3 min-w-[208px] cursor-pointer">
                    <span className="w-6 h-6">{item.icon}</span>
                    <span className="text-p2 font-sans">{item.title}</span>
                  </div>
                </Item>
              )}
              {/* {(item) => (
                <Item key={item.key}>
                  <div className="font-sans flex items-center justify-center gap-3">
                    <span className="w-6 h-6">{item.icon}</span>
                    <span className="text-p2 font-sans">{item.title}</span>
                  </div>
                </Item>
              ))} */}
            </FormMenuButton>
            {/* <Menu buttonIcon={<ThreePointsIcon />} label="">
              {[
                { id: 1, title: 'Vyplniť cez eID', icon: <ThreePointsIcon />, link: '/' },
                { id: 2, title: 'Stiahnuť ako XML', icon: <ThreePointsIcon />, link: '/' },
              ].map((option) => (
                <Item key={option.id}>{option.title}</Item>
              ))}
            </Menu> */}
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
