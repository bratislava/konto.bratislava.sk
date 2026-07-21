import { Injectable } from '@nestjs/common'

import { LoginClientEnum } from '../generated/prisma/client'
import { UserService } from '../user/user.service'

@Injectable()
export class DpbService {
  constructor(private readonly userService: UserService) {}

  async getUserLoginClientList() {
    return await this.userService.getUserLoginClientList(LoginClientEnum.DPB)
  }
}
