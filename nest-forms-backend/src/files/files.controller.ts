import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { contentType } from 'mime-types'

import {
  UserInfo,
  UserInfoResponse,
} from '../auth/decorators/user-info.decorator'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import BasicGuard from '../auth/guards/auth-basic.guard'
import CognitoGuard from '../auth/guards/cognito.guard'
import { User } from '../utils/decorators/request.decorator'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BufferedFileDto,
  DownloadTokenResponseDataDto,
  FormDataFileDto,
  GetFileResponseReducedDto,
  PostFileResponseDto,
  UpdateFileStatusRequestDto,
  UpdateFileStatusResponseDto,
} from './files.dto'
import FilesService from './files.service'

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export default class FilesController {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly filesService: FilesService) {
    this.logger = new LineLoggerSubservice('FilesController')
  }

  @ApiOperation({
    summary: 'List of files and statuses based on formId',
    description:
      'If you need list of files and their file statuses based on formId.',
  })
  @ApiOkResponse({
    description: 'List of files and their statuses',
    type: GetFileResponseReducedDto,
    isArray: true,
  })
  @UseGuards(new CognitoGuard(true))
  @Get('forms/:formId')
  getFilesStatusByForm(
    @Param('formId') formId: string,
    @UserInfo() userInfo: UserInfoResponse,
    @User() user?: CognitoGetUserData,
  ): Promise<GetFileResponseReducedDto[]> {
    return this.filesService.getFilesByForm(formId, userInfo?.ico ?? null, user)
  }

  // patch controller which accepts status updates for file. Add swagger documentation.
  @ApiOperation({
    summary: 'Endpoint for updating file status from scanner.',
    description:
      'You have to provide scannerId and status which you want to update. Service will return updated file with status saying that file was updated. If not then proper error will be propagated.',
  })
  @ApiOkResponse({
    description: 'Successfully updated file status',
    type: UpdateFileStatusResponseDto,
  })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  @Patch('scan/:scannerId')
  updateFileStatusScannerId(
    @Body() statusObject: UpdateFileStatusRequestDto,
    @Param('scannerId') scannerId: string,
  ): Promise<UpdateFileStatusResponseDto> {
    return this.filesService.updateFileStatusScannerId(
      scannerId,
      statusObject.status,
    )
  }

  @ApiOperation({
    summary: 'Upload file to form',
    description: 'You can upload file to form. ',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        filename: {
          type: 'string',
        },
        id: {
          type: 'string',
        },
      },
    },
  })
  @UseGuards(new CognitoGuard(true))
  @Post('upload/:formId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: BufferedFileDto,
    @Param('formId') formId: string,
    @Body() body: FormDataFileDto,
    @UserInfo() userInfo: UserInfoResponse,
    @User() user?: CognitoGetUserData,
  ): Promise<PostFileResponseDto> {
    return this.filesService.uploadFile(
      formId,
      file,
      body,
      userInfo?.ico ?? null,
      user,
    )
  }

  @ApiOperation({
    summary: 'Obtain jwt token form file download',
    description: 'To be able to download file you need to obtain jwt token. ',
  })
  @UseGuards(new CognitoGuard(true))
  @Get('download/jwt/:fileId')
  async downloadToken(
    @Param('fileId') fileId: string,
    @UserInfo() userInfo: UserInfoResponse,
    @User() user?: CognitoGetUserData,
  ): Promise<DownloadTokenResponseDataDto> {
    return this.filesService.downloadToken(fileId, userInfo?.ico ?? null, user)
  }

  @ApiOperation({
    summary: 'Download file by jwt token',
    description: 'You can download file byt fileId. ',
  })
  @ApiOkResponse({
    description: 'Filestream as output.',
    content: {
      'application/octet-stream': {},
    },
  })
  @Get('download/file/:jwtToken')
  async downloadFile(
    @Param('jwtToken') jwtToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileId = this.filesService.decodeFileIdFromJwtToken(jwtToken)
    const fileStream = await this.filesService.downloadFile(fileId)
    const file = await this.filesService.getFile(fileId)
    res.set({
      'Content-Type': contentType(file.fileName),
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    })
    return new StreamableFile(fileStream)
  }
}
