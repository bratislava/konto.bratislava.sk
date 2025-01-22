import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common'

import {
  Configuration,
  UsersManipulationApi,
} from '../../generated-clients/nest-city-account'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'

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

    throw new HttpException('error to get birthnumber', 400)
  },
)
