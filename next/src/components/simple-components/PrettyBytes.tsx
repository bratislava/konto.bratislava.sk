import prettyBytes, { Options } from 'pretty-bytes'
import React from 'react'

type PrettyBytesProps = { number: number | any; options?: Omit<Options, 'locale'> }

const PrettyBytes = ({ number, options = {} }: PrettyBytesProps) => {
  if (typeof number !== 'number') {
    return null
  }

  return <>{prettyBytes(number, { ...options })}</>
}

export default PrettyBytes
