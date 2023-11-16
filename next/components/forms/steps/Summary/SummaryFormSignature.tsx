import React, { useMemo } from 'react'

import { useFormSignature } from '../../signer/useFormSignature'
import { useFormSignerLoader } from '../../signer/useFormSignerLoader'
import ButtonNew from '../../simple-components/ButtonNew'
import { useFormState } from '../../useFormState'

const SummaryFormSignature = () => {
  const { isSigned } = useFormState()
  const { isLoading, isReady } = useFormSignerLoader()
  const { signature, sign, isValidSignature, remove } = useFormSignature()

  const validSignature = useMemo(() => isValidSignature(), [isValidSignature])

  if (!isSigned) {
    return null
  }

  return (
    <>
      {signature && <span>{validSignature ? 'Podpísané' : 'Starý podpis'}</span>}
      <ButtonNew
        variant="black-solid"
        isLoading={isLoading}
        isDisabled={!isReady}
        onPress={() => sign()}
      >
        Podpísať
      </ButtonNew>
      {signature && (
        <ButtonNew variant="black-solid" onPress={() => remove()}>
          Odobrať podpis
        </ButtonNew>
      )}
    </>
  )
}

export default SummaryFormSignature
