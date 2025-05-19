import { Body, Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiCognitoGuestIdentityIdAuth } from 'src/auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { UserAuthGuard } from 'src/auth-v2/guards/user-auth.guard'

import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { User } from '../auth-v2/types/user'
import { CreateFormInputDto } from './inputs/create-form.input'
import { CreateFormOutputResponseDto } from './outputs/create-form.output'
import { FormsV2Service } from './services/forms-v2.service'

@ApiTags('Forms V2')
@Controller('forms-v2')
export default class FormsV2Controller {
  constructor(private readonly formsService: FormsV2Service) {}

  // @ApiCognitoGuestIdentityIdAuth()
  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Bump form JSON version to latest available version',
  //   description: 'Updates form JSON version if a newer version is available',
  // })
  // @UseGuards(UserAuthGuard)
  // @Get(':id')
  // async bumpJsonVersion(@Req() request: Request, @Param('id') id: string) {
  //   const now = performance.now()
  //   const x = await this.prismaService.forms.findFirst({
  //     where: {
  //       id: 'a9ed6975-b064-4893-9d90-fe0085cf784f',
  //     },
  //   })
  //   console.log(
  //     `[bumpJsonVersion] After prismaService.forms.findFirst: ${(performance.now() - now).toFixed(2)}ms`,
  //   )
  //
  //   return {
  //     user: (request as any).user,
  //     formId: id,
  //     success: true,
  //   }
  // }

  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bump form JSON version to latest available version',
    description: 'Updates form JSON version if a newer version is available',
  })
  @UseGuards(UserAuthGuard)
  @Get(':id')
  async createForm(
    @Body() input: CreateFormInputDto,
    @GetUser() user: User,
  ): Promise<CreateFormOutputResponseDto> {
    const result = await this.formsService.createForm({
      formDefinitionSlug: input.formDefinitionSlug,
      user,
    })

    return {
      status: 'success',
      data: {
        id: result.id,
      },
    }
  }
}
