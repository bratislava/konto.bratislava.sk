import { Button } from "@bratislava/component-library"

import InputField from "@/src/components/widget-components/InputField/InputField"

export type TowingSectionProps = {
  title: string
  description: string
}

const Towing = ({ title, description }: TowingSectionProps) => {
  const handleSubmit = () => {
    console.log('submit')
  }

  return (
    <>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div>
        <p>Zadajte platné evidenčné číslo vozidla bez medzier. Napríklad: BA123AB</p>
        <InputField name="vehicle-registration" label="Evidenčné číslo vozidla" />
        <Button onPress={handleSubmit} variant='solid'>Vyhľadať</Button>
      </div>
    </>
  )
}

export default Towing
