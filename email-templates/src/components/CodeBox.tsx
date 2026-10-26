/** A one-time code, large and centred, so it is easy to read and copy. */
export const CodeBox = ({ code }: { code: string }) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    className="mb-[16px]"
  >
    <tbody>
      <tr>
        <td align="center" className="ba-code rounded-[8px] bg-code p-[24px]">
          <p className="ba-text m-0 font-sans text-[32px] leading-[40px] font-semibold tracking-[4px] text-ink">
            {code}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
)
