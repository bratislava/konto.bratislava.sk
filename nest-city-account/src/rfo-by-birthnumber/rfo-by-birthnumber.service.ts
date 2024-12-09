import { Injectable } from '@nestjs/common'

import { MagproxyService } from '../magproxy/magproxy.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RfoByBirthnumberService {
  constructor(
    private readonly magproxyService: MagproxyService,
    private readonly prismaService: PrismaService
  ) {}

  async create(birthNumber: string, physicalEntityId?: string) {
    const result = await this.magproxyService.rfoBirthNumberList(birthNumber)
    if (result.length === 0) {
      return {
        rfoByBirthNumber: null,
        request: result,
      }
    } else {
      return {
        rfoByBirthNumber: await this.prismaService.rfoByBirthnumber.create({
          data: {
            birthNumber,
            data: JSON.stringify(result),
            physicalEntityId,
          },
        }),
        request: result,
      }
    }
  }
}
