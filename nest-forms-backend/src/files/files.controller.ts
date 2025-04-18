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
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
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
import {
  FormDefinitionNotFoundErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import {
  FileAlreadyProcessedErrorDto,
  FileInScannerNotFoundErrorDto,
  FileSizeTooLargeErrorDto,
  FileWrongParamsErrorDto,
  ProblemWithScannerErrorDto,
} from '../scanner-client/scanner-client.errors.dto'
import { User } from '../utils/decorators/request.decorator'
import {
  BadRequestDecoratorErrorDto,
  DatabaseErrorDto,
  SimpleBadRequestErrorDto,
  UnauthorizedErrorDto,
} from '../utils/global-dtos/errors.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BufferedFileDto,
  DownloadTokenResponseDataDto,
  FormDataFileDto,
  GetFileResponseDto,
  GetFileResponseReducedDto,
  PostFileResponseDto,
  UpdateFileStatusRequestDto,
  UpdateFileStatusResponseDto,
} from './files.dto'
import {
  FileByScannerIdNotFoundErrorDto,
  FileHasUnsupportedMimeTypeErrorDto,
  FileIdAlreadyExistsErrorDto,
  FileIsOwnedBySomeoneElseErrorDto,
  FileNotFoundErrorDto,
  FileSizeExceededErrorDto,
  FileSizeZeroErrorDto,
  FileUploadToMinioWasNotSuccessfulErrorDto,
  FileWrongStatusNotAcceptedErrorDto,
  InvalidJwtTokenErrorDto,
  InvalidOrExpiredJwtTokenErrorDto,
  NoFileIdInJwtErrorDto,
  NoFileUploadDataErrorDto,
  ScannerNoResponseErrorDto,
} from './files.errors.dto'
import FilesService from './files.service'

@ApiTags('Files')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized.',
  type: UnauthorizedErrorDto,
})
@Controller('files')
export default class FilesController {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly filesService: FilesService) {
    this.logger = new LineLoggerSubservice('FilesController')
  }

  @ApiOperation({
    summary: 'Get file by fileId',
    description: 'You get all file info based on fileId.',
  })
  @ApiOkResponse({
    description: 'Status of file',
    type: GetFileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Forbidden.',
    type: FileIsOwnedBySomeoneElseErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found.',
    type: FileNotFoundErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Get(':fileId')
  getFile(
    @Param('fileId') fileId: string,
    @UserInfo() userInfo: UserInfoResponse,
    @User() user?: CognitoGetUserData,
  ): Promise<GetFileResponseDto> {
    return this.filesService.getFileWithUserVerify(
      fileId,
      userInfo?.ico ?? null,
      user,
    )
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
  @ApiForbiddenResponse({
    description: 'Form is Forbidden.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Form not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: DatabaseErrorDto,
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
  @ApiNotFoundResponse({
    description: 'File or bucket not found.',
    type: FileByScannerIdNotFoundErrorDto,
  })
  @ApiNotAcceptableResponse({
    description: 'File status is not acceptable.',
    type: FileWrongStatusNotAcceptedErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: DatabaseErrorDto,
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
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(FileInScannerNotFoundErrorDto)
  @ApiExtraModels(FileWrongParamsErrorDto)
  @ApiExtraModels(ProblemWithScannerErrorDto)
  @ApiExtraModels(NoFileUploadDataErrorDto)
  @ApiExtraModels(BadRequestDecoratorErrorDto)
  @ApiExtraModels(FileHasUnsupportedMimeTypeErrorDto)
  @ApiExtraModels(FileSizeExceededErrorDto)
  @ApiExtraModels(FileSizeZeroErrorDto)
  @ApiExtraModels(ScannerNoResponseErrorDto)
  @ApiBadRequestResponse({
    description: 'Bad request.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(NoFileUploadDataErrorDto),
        },
        {
          $ref: getSchemaPath(BadRequestDecoratorErrorDto),
        },
        {
          $ref: getSchemaPath(FileWrongParamsErrorDto),
        },
        {
          $ref: getSchemaPath(FileHasUnsupportedMimeTypeErrorDto),
        },
        {
          $ref: getSchemaPath(FileSizeExceededErrorDto),
        },
        {
          $ref: getSchemaPath(FileSizeZeroErrorDto),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FileNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FileInScannerNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiNotAcceptableResponse({
    description: 'File id already exists.',
    type: FileIdAlreadyExistsErrorDto,
  })
  @ApiGoneResponse({
    description: 'File is already scanned.',
    type: FileAlreadyProcessedErrorDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'File is too large.',
    type: FileSizeTooLargeErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    type: FileUploadToMinioWasNotSuccessfulErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(ProblemWithScannerErrorDto),
        },
        {
          $ref: getSchemaPath(ScannerNoResponseErrorDto),
        },
      ],
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
  @ApiExtraModels(DatabaseErrorDto)
  @ApiNotFoundResponse({
    description: 'File not found',
    type: FileNotFoundErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    type: DatabaseErrorDto,
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
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(InvalidJwtTokenErrorDto)
  @ApiExtraModels(FileNotFoundErrorDto)
  @ApiExtraModels(NoFileIdInJwtErrorDto)
  @ApiExtraModels(SimpleBadRequestErrorDto)
  @ApiBadRequestResponse({
    description: 'Bad request error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(SimpleBadRequestErrorDto),
        },
        {
          $ref: getSchemaPath(InvalidJwtTokenErrorDto),
        },
        {
          $ref: getSchemaPath(NoFileIdInJwtErrorDto),
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized error - invalid or expired jwt token.',
    type: InvalidOrExpiredJwtTokenErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found error.',
    type: FileNotFoundErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    type: DatabaseErrorDto,
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
