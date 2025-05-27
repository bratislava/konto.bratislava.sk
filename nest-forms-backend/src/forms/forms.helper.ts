import { Injectable } from '@nestjs/common'
import { Forms, FormState } from '@prisma/client'

import { UserInfoResponse } from '../auth/decorators/user-info.decorator'
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
    userInfo?: UserInfoResponse,
    userSub?: string,
  ): boolean {
    // If owned by company, it must have the same ICO
    if (form.ico != null) {
      return form.ico === userInfo?.ico
    }

    // If owned by user, it must have the same user sub
    if (form.userExternalId != null) {
      return form.userExternalId === userSub
    }

    return true
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

    // TODO setup and use config module
    // we can't login into fix slovensko.sk with the id cards we're signing the form with, so the check for uris would never match
    // this should only happen on non-production environments
    if (
      process.env.SLOVENSKO_SK_CONTAINER_URI ===
      'https://fix.slovensko-sk-api.bratislava.sk'
    )
      return true

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
