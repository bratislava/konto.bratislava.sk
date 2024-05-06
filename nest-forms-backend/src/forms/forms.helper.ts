import { Injectable } from '@nestjs/common'
import { Forms, FormState } from '@prisma/client'

import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import { EDITABLE_ERRORS } from '../utils/constants'

@Injectable()
export default class FormsHelper {
  isFormAccessGranted(
    form: Forms,
    user: string | null,
    ico: string | null,
  ): boolean {
    // if file is not owned by anyone, so we will show it
    if (
      form.userExternalId === null &&
      form.ico === null &&
      form.mainUri === null &&
      form.actorUri === null
    ) {
      return true
    }

    // If file is owned by a company, the user must have the same ICO
    if (form.ico !== null) {
      return form.ico === ico
    }

    // if file is owned by the user through city account and not owned by eid uri
    if (
      form.userExternalId === user &&
      form.mainUri === null &&
      form.actorUri === null
    ) {
      return true
    }

    // if file is owned by someone else through city account and not owned by eid uri
    if (
      form.userExternalId !== user &&
      form.userExternalId !== null &&
      form.mainUri === null &&
      form.actorUri === null
    ) {
      return false
    }

    // if file is owned by the user through eid uri and not owned by city account otherwise return false
    return !(
      form.mainUri !== null &&
      form.actorUri !== null &&
      form.userExternalId === null
    )
  }

  userCanSendForm(
    form: Forms,
    userInfo: ResponseGdprDataDto,
    userSub?: string,
  ): boolean {
    // If user is not provided return false.
    if (!userSub) {
      return false
    }
    // if file is not owned by anyone, it can't be sent
    if (form.userExternalId === null) {
      return false
    }

    // If owned by company, it must have the same ICO
    if (form.ico !== null) {
      return form.ico === userInfo.ico
    }

    // Can be sent if uri is set and also it is the logged in user's form.
    return form.userExternalId === userSub
  }

  userCanSendFormEid(
    form: Forms,
    mainUri: string,
    actorUri: string,
    userExternalId?: string,
  ): boolean {
    // If form is owned by someone, do not allow send if it is not the user's
    if (
      form.userExternalId !== null &&
      form.userExternalId !== userExternalId
    ) {
      return false
    }

    // If no uri is assigned, allow
    if (form.mainUri === null && form.actorUri === null) return true

    // The uri from token must match the uri of the form
    return mainUri === form.mainUri && actorUri === form.actorUri
  }

  static isEditable(form: Forms): boolean {
    return (
      form.state === FormState.DRAFT ||
      (form.state === FormState.ERROR && EDITABLE_ERRORS.includes(form.error))
    )
  }
}
