import { Button, Typography } from '@bratislava/component-library'

import TextField from '@/src/components/fields/TextField'
import Icon from '@/src/components/icon-components/Icon'

export type TowingSectionProps = {
  title: string
  description: string
}

const Towing = ({ title, description }: TowingSectionProps) => {
  const handleSubmit = () => {
    console.log('submit')
  }

  return (
    <div className="flex flex-col gap-4">
      {title && <Typography variant="h2">{title}</Typography>}

      {description && <Typography variant="p-default">{description}</Typography>}

      <div className="flex flex-col gap-4 rounded-xl border px-5 py-6">
        <div className="flex flex-col">
          <Typography variant="p-default">
            Zadajte platné evidenčné číslo vozidla bez medzier.
            <br />
            Napríklad: BA123AB
          </Typography>

          <TextField label="" displayOptionalLabel={false} />
        </div>

        <Button onPress={handleSubmit} variant="solid" fullWidth>
          <Icon name="search" />
          Vyhľadať
        </Button>
      </div>
    </div>
  )
}

export default Towing
