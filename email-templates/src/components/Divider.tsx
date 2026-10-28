import { colors } from '../theme/tokens'

/**
 * A 2px line with 32px above and below. A table cell border rather than `<hr>`, which Outlook draws
 * with its own margins and colour.
 */
export const Divider = () => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    // Leaves no empty line in the plain-text version.
    data-skip-in-text
  >
    <tbody>
      <tr>
        <td className="py-[32px]">
          <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
            <tbody>
              <tr>
                <td
                  className={`ba-divider text-[0px] leading-[0px] [border-top:2px_solid_${colors.light.divider}]`}
                >
                  &nbsp;
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
)
