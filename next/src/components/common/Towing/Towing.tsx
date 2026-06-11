import { Button, Typography } from '@bratislava/component-library'
import { useState } from 'react'

import Table from '@/src/components/common/Table/Table'
import TextField from '@/src/components/fields/TextField'
import Icon from '@/src/components/icon-components/Icon'
import Alert from '@/src/components/simple-components/Alert'

export type TowingSectionProps = {
  title: string
  description: string
}

const Towing = ({ title, description }: TowingSectionProps) => {
  const [vehicle, setVehicle] = useState<{
    licensePlate: string
    dateOfTowing: string
    timeOfTowing: string
    towingLocation: string
    towingReason: string
    towingFine: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = () => {
    setVehicle({
      licensePlate: 'BA123AB',
      dateOfTowing: '27.04.2026',
      timeOfTowing: '10\\:10',
      towingLocation: 'Prístavný most',
      towingReason: 'státie v jazdnom pruhu',
      towingFine: '179.00€ + pokuta',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {title && <Typography variant="h2">{title}</Typography>}

      {description && <Typography variant="p-default">{description}</Typography>}

      <div className="flex flex-col gap-4 rounded-xl border px-5 py-6">
        <Typography variant="p-default">
          Zadajte platné evidenčné číslo vozidla bez medzier.
          <br />
          Napríklad: BA123AB
        </Typography>

        <div className="flex flex-col gap-2 md:flex-row md:gap-6">
          <TextField
            label=""
            displayOptionalLabel={false}
            errorMessage={errorMessage}
            className="h-12"
          />

          <Button onPress={handleSubmit} variant="solid" fullWidthMobile className="mt-2 h-12">
            <Icon name="search" />
            Vyhľadať
          </Button>
        </div>
      </div>

      {vehicle && (
        <div className="flex flex-col gap-4">
          <Typography variant="h3">
            Informácia o odťahu vozidla s evidenčným číslom {vehicle.licensePlate}
          </Typography>

          <Table
            rows={Object.keys(vehicle).map((key) => ({ label: key, value: vehicle[key] }))}
            notification={
              <Alert
                message='Od 15.04.2023 za každý deň po 10. dni od odtiahnutia do areálu odťahovej služby je účtované "stojné" vo výške 5€ s DPH/deň.'
                type="info"
                fullWidth
              />
            }
          />
        </div>
      )}
    </div>
  )
}

export default Towing
