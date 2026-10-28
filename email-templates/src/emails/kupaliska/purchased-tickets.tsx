import { Img } from 'react-email'

import { Greeting } from '../../components/Greeting'
import { Heading, MailtoLink, Paragraph, Subheading, TextLink } from '../../components/Typography'
import { formatPrice } from '../../i18n/format'
import { useAssetUrl } from '../../render/context'
import { defineEmail } from '../../render/define-email'
import { colors } from '../../theme/tokens'

export type KupaliskaTicket = {
  /** Ticket type, e.g. "Sezónna permanentka – dospelý". */
  heading: string
  /** Who the ticket is for, e.g. the holder's name. */
  subheading: string | null
  /** QR code image, hosted by the Kúpaliská backend. */
  qrCodeUrl: string
  /** Colours of the ticket's header, set by ticket type so staff recognise it at the entrance. */
  backgroundColor: string
  textColor: string
  appleWalletUrl: string | null
  googleWalletUrl: string | null
}

export type KupaliskaPurchasedTicketsEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
  tickets: KupaliskaTicket[]
  purchase: {
    /** `price` is the price of the line (quantity × unit price), in euros. */
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
  }
}

const WalletBadge = ({
  href,
  path,
  width,
  alt,
}: {
  href: string
  path: string
  width: number
  alt: string
}) => {
  const assetUrl = useAssetUrl()

  return (
    <a href={href} className="inline-block">
      <Img src={assetUrl(path)} width={width} height={48} alt={alt} data-alt-in-text />
    </a>
  )
}

const TicketCard = ({ ticket }: { ticket: KupaliskaTicket }) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    className="mb-[24px] rounded-[16px]"
    style={{ border: `2px solid ${ticket.backgroundColor}` }}
  >
    <tbody>
      <tr>
        <td
          align="center"
          className="rounded-t-[14px] px-[16px] py-[16px]"
          style={{ backgroundColor: ticket.backgroundColor }}
        >
          <p
            className="m-0 font-sans text-[20px] leading-[28px] font-semibold"
            style={{ color: ticket.textColor }}
          >
            {ticket.heading}
          </p>
          {ticket.subheading && (
            <p
              className="m-0 font-sans text-[16px] leading-[24px]"
              style={{ color: ticket.textColor }}
            >
              {ticket.subheading}
            </p>
          )}
        </td>
      </tr>
      <tr>
        <td align="center" className="p-[24px]">
          <Img src={ticket.qrCodeUrl} width={264} height={264} alt={`QR kód: ${ticket.heading}`} />
          {/* One badge per row: side by side they don't fit a phone screen. */}
          {ticket.appleWalletUrl && (
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              className="mt-[16px]"
            >
              <tbody>
                <tr>
                  <td align="center">
                    <WalletBadge
                      href={ticket.appleWalletUrl}
                      path="badges/apple-wallet.png"
                      width={185}
                      alt="Pridať do Peňaženky Apple"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {ticket.googleWalletUrl && (
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              className="mt-[8px]"
            >
              <tbody>
                <tr>
                  <td align="center">
                    <WalletBadge
                      href={ticket.googleWalletUrl}
                      path="badges/google-wallet.png"
                      width={206}
                      alt="Pridať do služby Google Peňaženka"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </td>
      </tr>
    </tbody>
  </table>
)

const purchaseCellClassName =
  'ba-text py-[8px] align-top font-sans text-[16px] leading-[24px] text-ink'

const PurchaseRecap = ({ purchase }: Pick<KupaliskaPurchasedTicketsEmailProps, 'purchase'>) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    className="mb-[16px]"
    data-text-format="dataTable"
  >
    <tbody>
      {purchase.items.map((item, index) => (
        <tr key={index}>
          <td className={`${purchaseCellClassName} w-[48px] pr-[8px]`}>{item.quantity}×</td>
          <td className={`${purchaseCellClassName} pr-[16px]`}>{item.name}</td>
          <td className={`${purchaseCellClassName} text-right whitespace-nowrap`}>
            {formatPrice(item.price, 'sk')}
          </td>
        </tr>
      ))}
      <tr>
        <td
          colSpan={2}
          className={`${purchaseCellClassName} ba-divider font-semibold [border-top:2px_solid_${colors.light.divider}]`}
        >
          Spolu
        </td>
        <td
          className={`${purchaseCellClassName} ba-divider text-right font-semibold whitespace-nowrap [border-top:2px_solid_${colors.light.divider}]`}
        >
          {formatPrice(purchase.total, 'sk')}
        </td>
      </tr>
    </tbody>
  </table>
)

/** After buying tickets or season passes for the city's swimming pools. */
export const kupaliskaPurchasedTicketsEmail = defineEmail<KupaliskaPurchasedTicketsEmailProps>({
  brand: 'kupaliska',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  subject: () => 'Vaše vstupy na kúpaliská',
  preview: () => 'Ďakujeme za nákup. QR kódy na vstup nájdete v tomto e-maile.',
  Content: ({ firstName, tickets, purchase }) => (
    <>
      <Heading>Hurá do vody, bez čakania v rade</Heading>
      <Greeting firstName={firstName} />
      <Paragraph>ďakujeme za Váš online nákup vstupov na kúpaliská v Bratislave.</Paragraph>
      <Paragraph>
        Vaše QR kódy nájdete priamo v tomto e-maile, spolu s daňovým dokladom sú aj v prílohe. Pri
        vstupe na kúpalisko sa, prosím, preukážte príslušným QR kódom. Vstupy môžete využiť na
        ktoromkoľvek z našich kúpalísk počas letnej sezóny.
      </Paragraph>
      {tickets.map((ticket, index) => (
        <TicketCard key={index} ticket={ticket} />
      ))}
      <Subheading>Rekapitulácia nákupu</Subheading>
      <PurchaseRecap purchase={purchase} />
      <Paragraph>
        V prípade akýchkoľvek otázok nás kontaktujte na adrese{' '}
        <MailtoLink email="kupaliska@bratislava.sk" />. Viac informácií nájdete v{' '}
        <TextLink href="https://kupaliska.bratislava.sk/#faqs">Najčastejších otázkach</TextLink>.
      </Paragraph>
    </>
  ),
})

export const renderKupaliskaPurchasedTicketsEmail = kupaliskaPurchasedTicketsEmail.render
