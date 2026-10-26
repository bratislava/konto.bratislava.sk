import { useAssetUrl, useEmailContext } from '../render/context'
import { RawHtml } from '../render/raw-html'
import { brands, cityLogo, type Logo } from '../theme/brands'

/**
 * A logo, and its dark variant where it has one. The dark variant is hidden until the dark-mode
 * styles show it, and is left out for classic Outlook, which would show both.
 */
const LogoImage = ({ logo }: { logo: Logo }) => {
  const assetUrl = useAssetUrl()
  const image = (path: string, className: string | undefined, hidden: boolean) => (
    <img
      src={assetUrl(path)}
      width={logo.width}
      height={logo.height}
      alt={logo.alt}
      className={className}
      style={{
        display: hidden ? 'none' : 'block',
        border: 0,
        outline: 'none',
        textDecoration: 'none',
        ...(hidden ? { maxHeight: 0, overflow: 'hidden' } : {}),
      }}
    />
  )

  if (!logo.darkPath) {
    return image(logo.path, undefined, false)
  }

  return (
    <>
      {image(logo.path, 'ba-light-only', false)}
      <RawHtml html="<!--[if !mso]><!-->" />
      {image(logo.darkPath, 'ba-dark-only', true)}
      <RawHtml html="<!--<![endif]-->" />
    </>
  )
}

/** The partner's logo (if any) and the city's, centred. */
export const Header = () => {
  const { brand } = useEmailContext()
  const { partner } = brands[brand]

  return (
    <table role="presentation" align="center" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          {partner && (
            <td className="pr-[24px] align-middle">
              <LogoImage logo={partner.logo} />
            </td>
          )}
          <td className="align-middle">
            <LogoImage logo={cityLogo} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}
