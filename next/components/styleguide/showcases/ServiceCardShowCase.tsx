import BasketServiceIcon from '@assets/images/account/municipal-services/basket-icon.svg'
import CompassServiceIcon from '@assets/images/account/municipal-services/compass-icon.svg'
import MoneyServiceIcon from '@assets/images/account/municipal-services/money-icon.svg'
import PoolServiceIcon from '@assets/images/account/municipal-services/pool-icon.svg'
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
            icon={<CompassServiceIcon className="w-10 h-10 lg:w-12 lg:h-12" />}
            buttonText="Prejsť na žiadosť"
            href="#"
          />
          <ServiceCard
            title="Dotácia na kontajnerové stanovištia"
            description="Žiadosť o dotáciu na kontajnerové stanovište alebo o nájom mestského pozemku."
            icon={<BasketServiceIcon className="w-10 h-10 lg:w-12 lg:h-12" />}
            buttonText="Prejsť na žiadosť"
            onPress={() => alert('Hello')}
          />
          <ServiceCard
            title="Digitálna platba dane z nehnuteľností"
            description="Digitálna platba dane z nehnuteľnosti, pohodlne a online."
            icon={<MoneyServiceIcon className="w-10 h-10 lg:w-12 lg:h-12" />}
            buttonText="Zaplatiť daň digitálne"
            href="#"
          />
          <ServiceCard
            title="Online lístky na kúpaliská"
            description="Kúpa online lístku alebo permanentky na všetky mestské kúpalíská v Bratislave."
            icon={<PoolServiceIcon className="w-10 h-10 lg:w-12 lg:h-12" />}
            buttonText="Kúpiť lístok"
            onPress={() => alert('Hello')}
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default ServiceCardShowCase
