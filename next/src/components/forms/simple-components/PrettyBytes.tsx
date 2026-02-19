import prettyBytes, { Options } from 'pretty-bytes'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-redundant-type-constituents
type PrettyBytesProps = { number: number | any; options?: Omit<Options, 'locale'> }

const PrettyBytes = ({ number, options = {} }: PrettyBytesProps) => {
  if (typeof number !== 'number') {
    return null
  }

  return <>{prettyBytes(number, { ...options })}</>
}

export default PrettyBytes
