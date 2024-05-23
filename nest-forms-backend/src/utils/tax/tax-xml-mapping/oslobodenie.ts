/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,import/prefer-default-export */
import { oslobodenieShared } from '../shared-mapping/oslobodenieShared'
import { TaxFormData } from '../types'

export const oslobodenieXml = (data: TaxFormData) => {
  const mapping = oslobodenieShared(data)

  return {
    Priloha: {
      Obec: mapping.obec,
      PozemkyA: mapping.pozemkyA,
      PozemkyB: mapping.pozemkyB,
      PozemkyC: mapping.pozemkyC,
      PozemkyD: mapping.pozemkyD,
      PozemkyE: mapping.pozemkyE,
      PozemkyF: mapping.pozemkyF,
      PozemkyG: mapping.pozemkyG,
      PozemkyH: mapping.pozemkyH,
      PozemkyI: mapping.pozemkyI,
      PozemkyJ: mapping.pozemkyJ,
      PozemkyK: mapping.pozemkyK,
      PozemkyL: mapping.pozemkyL,
      StavbyA: mapping.stavbyA,
      StavbyB: mapping.stavbyB,
      StavbyC: mapping.stavbyC,
      StavbyD: mapping.stavbyD,
      StavbyE: mapping.stavbyE,
      StavbyF: mapping.stavbyF,
      BytyA: mapping.bytyA,
      BytyB: mapping.bytyB,
      BytyC: mapping.bytyC,
      BytyD: mapping.bytyD,
      BytyE: mapping.bytyE,
      Poznamka: mapping.poznamka,
    },
  }
}
