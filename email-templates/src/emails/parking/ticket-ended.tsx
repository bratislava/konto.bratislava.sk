import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, Paragraph, Strong } from '../../components/Typography'
import { formatDateTime } from '../../i18n/format'
import { defineEmail } from '../../render/define-email'

export type ParkingTicketEndedEmailProps = {
  parkingZone: string
  vehiclePlateNumber: string
  /** When the ticket ended; shown in Bratislava time. */
  parkingEnd: Date
}

/** From the PAAS parking app, when a parking ticket has ended. */
export const parkingTicketEndedEmail = defineEmail<ParkingTicketEndedEmailProps>({
  brand: 'paas',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  subject: () => 'Váš parkovací lístok sa skončil',
  preview: ({ parkingZone, vehiclePlateNumber }) =>
    `Parkovací lístok v zóne ${parkingZone} pre vozidlo ${vehiclePlateNumber} sa skončil.`,
  Content: ({ parkingZone, vehiclePlateNumber, parkingEnd }) => (
    <>
      <StatusIcon kind="pending" />
      <Heading>Váš parkovací lístok sa skončil</Heading>
      <Greeting firstName={null} />
      <Paragraph>
        parkovací lístok do zóny <Strong>{parkingZone}</Strong> pre vozidlo{' '}
        <Strong>{vehiclePlateNumber}</Strong> sa skončil {formatDateTime(parkingEnd, 'sk')}.
      </Paragraph>
    </>
  ),
})

export const renderParkingTicketEndedEmail = parkingTicketEndedEmail.render
