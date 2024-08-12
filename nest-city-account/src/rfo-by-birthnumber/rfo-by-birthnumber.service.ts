import { Injectable } from '@nestjs/common'
import { RfoByBirthnumber } from '@prisma/client'

import { MagproxyService } from '../magproxy/magproxy.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RfoByBirthnumberService {
  constructor(
    private readonly magproxyService: MagproxyService,
    private readonly prismaService: PrismaService
  ) {}

  async create(birthnumber: string, physicalEntityId?: string): Promise<RfoByBirthnumber | null> {
    const result = await this.magproxyService.rfoBirthNumberList(birthnumber)
    if (result.length === 0) {
      return null
    } else {
      return this.prismaService.rfoByBirthnumber.create({
        data: {
          birthNumber: birthnumber,
          data: JSON.stringify(result),
          physicalEntityId,
        },
      })
    }
  }
}
