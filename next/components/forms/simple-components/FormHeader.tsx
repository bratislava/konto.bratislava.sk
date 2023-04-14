import DiskIcon from '@assets/images/forms/disk-icon.svg'
import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import ArrowsDownUpIcon from '@assets/images/new-icons/ui/arrows-down-up.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import LockIcon from '@assets/images/new-icons/ui/lock.svg'
import PdfIcon from '@assets/images/new-icons/ui/pdf.svg'
import Waves from 'components/forms/icon-components/Waves'
import Button from 'components/forms/simple-components/Button'
import MenuAria, { MenuItemBase } from 'components/forms/simple-components/Menu/MenuAria'
import Link from 'next/link'

const formHeaderMenuContent: MenuItemBase[] = [
  { title: 'Vyplniť cez eID', icon: <LockIcon />, key: 'eID', url: '/acc' },
  { title: 'Stiahnuť ako XML', icon: <DownloadIcon />, key: 'xmlDownload', url: '/' },
  { title: 'Stiahnuť ako PDF', icon: <PdfIcon />, key: 'pdf', url: '/' },
  { title: 'Nahrať z XML', icon: <ArrowsDownUpIcon />, key: 'xmlUpload', url: '/' },
]

const FormHeader = () => {
  return (
    <div className="flex flex-col relative">
      <div className="w-full h-full min-h-[120px] bg-main-200 py-12">
        <div className="justify-between max-w-screen-lg mx-auto flex">
          <div className="flex flex-col gap-4">
            <h1 className="text-h1">Záväzné stanovisko k investičnej činnosti</h1>
            <Link className="text-p1-underline w-max" href="/">
              Viac informácií o službe
            </Link>
          </div>
          <div className="h-full flex gap-3">
            <Button
              size="sm"
              variant="category-outline"
              startIcon={<DiskIcon />}
              text="Uložiť ako koncept"
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
            />
            <MenuAria
              items={formHeaderMenuContent}
              buttonClassName="w-10 h-10 flex justify-center items-center focus:outline-none rounded-lg border-2 border-main-700 hover:border-main-600 focus:border-main-800 hover:text-gray-600 focus:text-gray-800"
              buttonIcon={<ThreePointsIcon />}
              offset={0}
            />
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
