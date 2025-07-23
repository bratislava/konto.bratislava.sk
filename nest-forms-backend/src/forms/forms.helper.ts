import { Injectable } from '@nestjs/common'
import { Forms, FormState } from '@prisma/client'

import { EDITABLE_ERRORS } from '../utils/constants'

@Injectable()
export default class FormsHelper {
  static isEditable(form: Forms): boolean {
    return (
      form.state === FormState.DRAFT ||
      (form.state === FormState.ERROR && EDITABLE_ERRORS.includes(form.error))
    )
  }
}
