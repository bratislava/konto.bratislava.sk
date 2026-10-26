import { Img } from 'react-email'

import { useAssetUrl } from '../render/context'

export type StatusIconKind = 'success' | 'error' | 'warning' | 'pending' | 'sent'

/** Decorative icon above the heading; the heading says the same in words, so the alt is empty. */
export const StatusIcon = ({ kind }: { kind: StatusIconKind }) => {
  const assetUrl = useAssetUrl()

  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td align="center" className="pb-[24px]">
            <Img src={assetUrl(`icons/${kind}.png`)} width={88} height={88} alt="" />
          </td>
        </tr>
      </tbody>
    </table>
  )
}
