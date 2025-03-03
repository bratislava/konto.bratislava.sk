import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../../form-utils/safeData'

export const tsbExtractEmail = (formData: GenericObjectType) => {
  return safeString(formData.objednavatel?.email || formData.ziadatel?.email)
}

export const tsbExtractName = (formData: GenericObjectType) => {
  if (formData.objednavatel) {
    if (
      formData.objednavatel.objednavatelTyp === 'Fyzická osoba' ||
      formData.objednavatel.objednavatelTyp === 'Fyzická osoba - podnikateľ'
    ) {
      return safeString(formData.objednavatel.menoPriezvisko?.meno)
    }
    if (formData.objednavatel.objednavatelTyp === 'Právnická osoba') {
      return safeString(formData.objednavatel.obchodneMeno)
    }
  } else if (formData.ziadatel) {
    return // TODO - neobsahuje meno priezvisko zatial
  }
}
