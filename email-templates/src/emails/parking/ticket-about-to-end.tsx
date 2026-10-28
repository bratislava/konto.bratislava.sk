import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, Paragraph, Strong } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type ParkingTicketAboutToEndEmailProps = {
  parkingZone: string
  vehiclePlateNumber: string
}

/** From the PAAS parking app, 15 minutes before a parking ticket ends. */
export const parkingTicketAboutToEndEmail = defineEmail<ParkingTicketAboutToEndEmailProps>({
  brand: 'paas',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  subject: () => 'Váš parkovací lístok sa skončí o 15 minút',
  preview: ({ parkingZone, vehiclePlateNumber }) =>
    `Parkovací lístok v zóne ${parkingZone} pre vozidlo ${vehiclePlateNumber} sa skončí o 15 minút.`,
  Content: ({ parkingZone, vehiclePlateNumber }) => (
    <>
      <StatusIcon kind="pending" />
      <Heading>Váš parkovací lístok sa skončí o 15 minút</Heading>
      <Greeting firstName={null} />
      <Paragraph>
        parkovací lístok do zóny <Strong>{parkingZone}</Strong> pre vozidlo{' '}
        <Strong>{vehiclePlateNumber}</Strong> sa skončí o 15 minút.
      </Paragraph>
    </>
  ),
})

export const renderParkingTicketAboutToEndEmail = parkingTicketAboutToEndEmail.render
