import MoneyServiceIcon from '@assets/icons/city-bratislava/taxes-and-fees.svg'
import PoolServiceIcon from '@assets/icons/education-sport/swimming-pool.svg'
import CompassServiceIcon from '@assets/icons/environment-construction/spatial-planning.svg'
import BasketServiceIcon from '@assets/icons/environment-construction/waste.svg'
import React from 'react'

import ServiceCard from '../../forms/simple-components/ServiceCard'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ServiceCardShowCase = () => {
  return (
    <Wrapper direction="column" title="Service Card">
      <Stack>
        <div className="scrollbar-hide flex overflow-x-scroll">
          <ServiceCard
            title="Záväzné stanovisko k investičnej činnosti"
            description="Záväzné stanovisko slúži ako podklad pre konanie vedené na príslušnom stavebnom úrade."
            icon={<CompassServiceIcon className="text-environment-700 size-10 lg:size-12" />}
            buttonText="Prejsť na žiadosť"
            href="#"
          />
          <ServiceCard
            title="Dotácia na kontajnerové stanovištia"
            description="Žiadosť o dotáciu na kontajnerové stanovište alebo o nájom mestského pozemku."
            icon={<BasketServiceIcon className="text-environment-700 size-10 lg:size-12" />}
            buttonText="Prejsť na žiadosť"
            href="#"
          />
          <ServiceCard
            title="Digitálna platba dane z nehnuteľností"
            description="Digitálna platba dane z nehnuteľnosti, pohodlne a online."
            icon={<MoneyServiceIcon className="text-main-700 size-10 lg:size-12" />}
            buttonText="Zaplatiť daň digitálne"
            href="#"
          />
          <ServiceCard
            title="Online lístky na kúpaliská"
            description="Kúpa online lístku alebo permanentky na všetky mestské kúpalíská v Bratislave."
            icon={<PoolServiceIcon className="text-education-700 size-10 lg:size-12" />}
            buttonText="Kúpiť lístok"
            href="#"
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default ServiceCardShowCase
