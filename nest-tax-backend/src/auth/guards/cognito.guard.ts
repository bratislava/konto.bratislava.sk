import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import {
  Configuration,
  UsersManipulationApi,
} from 'openapi-clients/city-account'

import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'

export const BratislavaUser = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const cityAccountApi = new UsersManipulationApi(
      new Configuration({}),
      process.env.CITY_ACCOUNT_API_URL,
    )
    const request = ctx.switchToHttp().getRequest()
    const bearerToken = request.headers.authorization

    const userRequest = await cityAccountApi.userControllerGetOrCreateUser({
      headers: {
        Authorization: bearerToken,
      },
    })
    const user = userRequest.data

    if (user.birthNumber) {
      const birthNumberWithSlash: string = addSlashToBirthNumber(
        user.birthNumber,
      )
      return { ...user, birthNumber: birthNumberWithSlash }
    }

    const thrower = new ThrowerErrorGuard()
    throw thrower.BadRequestException(
      ErrorsEnum.BAD_REQUEST_ERROR,
      'error to get birthnumber',
    )
  },
)
