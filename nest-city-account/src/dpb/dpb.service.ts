import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { LoginClientEnum } from '@prisma/client'

@Injectable()
export class DpbService {
  constructor(private readonly userService: UserService) {}

  async getUserLoginClientList() {
    return await this.userService.getUserLoginClientList(LoginClientEnum.DPB)
  }
}
