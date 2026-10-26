import { Fragment } from 'react'

/** Line breaks as `<br>`: classic Outlook and Outlook on the web ignore `white-space: pre-wrap`. */
export const MultilineText = ({ value }: { value: string }) =>
  value.split(/\r\n|\r|\n/).map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ))
