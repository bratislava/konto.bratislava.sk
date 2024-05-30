import {
  DanZBytovANebytovychPriestorovPriznanie,
  DanZPozemkovPriznania,
  TaxFormData,
} from '../../types'
import { safeArray } from '../shared/functions'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'

const pozemkyChunks = 17
const nebytovePriestoryChunks = 15

const chunkDanZPozemkov = (priznania: DanZPozemkovPriznania[]) => {
  const chunked = priznania.map((priznanie) => {
    const safePozemky = safeArray(priznanie.pozemky)
    if (!safePozemky) {
      return [priznanie]
    }

    const chunkedPozemky = chunk(safePozemky, pozemkyChunks)
    if (chunkedPozemky.length <= 1) {
      return [priznanie]
    }

    return chunkedPozemky.map((pozemky) => {
      return {
        ...priznanie,
        pozemky,
      }
    })
  })

  return flatten(chunked)
}

const chunkDanZBytovANebytovychPriestorov = (
  priznania: DanZBytovANebytovychPriestorovPriznanie[],
) => {
  const chunked = priznania.map((priznanie) => {
    const safeNebytovePriestory = safeArray(
      priznanie.priznanieZaNebytovyPriestor?.nebytovePriestory,
    )
    if (!safeNebytovePriestory) {
      return [priznanie]
    }

    const chunkedNebytovePriestory = chunk(safeNebytovePriestory, nebytovePriestoryChunks)
    if (chunkedNebytovePriestory.length <= 1) {
      return [priznanie]
    }

    return chunkedNebytovePriestory.map((nebytovePriestory) => {
      return {
        ...priznanie,
        priznanieZaNebytovyPriestor: {
          ...priznanie.priznanieZaNebytovyPriestor,
          nebytovePriestory,
        },
      }
    })
  })

  return flatten(chunked)
}

export const chunkFormData = (formData: TaxFormData) => {
  const clonedData = structuredClone(formData)

  const safeDanZPozemkovPriznania = safeArray(clonedData.danZPozemkov?.priznania)
  if (safeDanZPozemkovPriznania && safeDanZPozemkovPriznania.length > 0) {
    clonedData.danZPozemkov!.priznania = chunkDanZPozemkov(safeDanZPozemkovPriznania)
  }

  const safeDanZBytovANebytovychPriestorovPriznania = safeArray(
    clonedData.danZBytovANebytovychPriestorov?.priznania,
  )
  if (
    safeDanZBytovANebytovychPriestorovPriznania &&
    safeDanZBytovANebytovychPriestorovPriznania.length > 0
  ) {
    clonedData.danZBytovANebytovychPriestorov!.priznania = chunkDanZBytovANebytovychPriestorov(
      safeDanZBytovANebytovychPriestorovPriznania,
    )
  }

  return clonedData
}
