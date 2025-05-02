import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiCognitoGuestIdentityIdAuth } from 'src/auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { UserAuthGuard } from 'src/auth-v2/guards/user-auth.guard'

import PrismaService from '../prisma/prisma.service'

@ApiTags('Forms V2')
@Controller('forms-v2')
export default class FormsV2Controller {
  constructor(private readonly prismaService: PrismaService) {}

  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bump form JSON version to latest available version',
    description: 'Updates form JSON version if a newer version is available',
  })
  @UseGuards(UserAuthGuard)
  @Get(':id')
  async bumpJsonVersion(@Req() request: Request, @Param('id') id: string) {
    const now = performance.now()
    const x = await this.prismaService.forms.findFirst({
      where: {
        id: 'a9ed6975-b064-4893-9d90-fe0085cf784f',
      },
    })
    console.log(
      `[bumpJsonVersion] After prismaService.forms.findFirst: ${(performance.now() - now).toFixed(2)}ms`,
    )

    return {
      user: (request as any).user,
      formId: id,
      success: true,
    }
  }
}
