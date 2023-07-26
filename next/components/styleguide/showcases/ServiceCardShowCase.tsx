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
        <div className="flex overflow-x-scroll scrollbar-hide">
          <ServiceCard
            title="Záväzné stanovisko k investičnej činnosti"
            description="Záväzné stanovisko slúži ako podklad pre konanie vedené na príslušnom stavebnom úrade."
            icon={<CompassServiceIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />}
            buttonText="Prejsť na žiadosť"
            href="#"
          />
          <ServiceCard
            title="Dotácia na kontajnerové stanovištia"
            description="Žiadosť o dotáciu na kontajnerové stanovište alebo o nájom mestského pozemku."
            icon={<BasketServiceIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />}
            buttonText="Prejsť na žiadosť"
            onPress={() => alert('Hello')}
          />
          <ServiceCard
            title="Digitálna platba dane z nehnuteľností"
            description="Digitálna platba dane z nehnuteľnosti, pohodlne a online."
            icon={<MoneyServiceIcon className="h-10 w-10 text-main-700 lg:h-12 lg:w-12" />}
            buttonText="Zaplatiť daň digitálne"
            href="#"
          />
          <ServiceCard
            title="Online lístky na kúpaliská"
            description="Kúpa online lístku alebo permanentky na všetky mestské kúpalíská v Bratislave."
            icon={<PoolServiceIcon className="h-10 w-10 text-education-700 lg:h-12 lg:w-12" />}
            buttonText="Kúpiť lístok"
            onPress={() => alert('Hello')}
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default ServiceCardShowCase
