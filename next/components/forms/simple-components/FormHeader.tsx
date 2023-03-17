import DiskIcon from '@assets/images/forms/disk-icon.svg'
import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import Waves from 'components/forms/icon-components/Waves'
import Button from 'components/forms/simple-components/Button'

const FormHeader = () => {
  return (
    <div className="flex flex-col pt-[57px] relative">
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
            <Button
              className="text-gray-700 hover:text-gray-600 focus:text-gray-800"
              size="sm"
              variant="category-outline"
              icon={<ThreePointsIcon />}
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
