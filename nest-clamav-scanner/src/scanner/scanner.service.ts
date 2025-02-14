import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStatus } from '@prisma/client';
import { contentType } from 'mime-types';
import { ClamavClientService } from 'src/clamav-client/clamav-client.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';

import { isBase64, isDefined, isValidUid } from '../common/utils/helpers';
import { PrismaService } from '../prisma/prisma.service';
import { ScanFileDto, ScanFileResponseDto, ScanStatusDto } from './scanner.dto';

@Injectable()
export class ScannerService {
  private readonly logger: Logger;
  private readonly clamavClientService: ClamavClientService;
  private readonly supportedMimeTypes: string[];

  constructor(
    private readonly configService: ConfigService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new Logger('ScannerService');
    this.clamavClientService = new ClamavClientService(configService);
    this.supportedMimeTypes = this.configService
      .get(`MIMETYPE_WHITELIST`)
      .split(' ');
  }

  public isSupportedMimeType(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType);
  }

  public async scanFile(bucketFile: ScanFileDto): Promise<ScanFileResponseDto> {
    {
      if (!isValid(bucketFile.fileUid)) {
        throw new BadRequestException('Please provide a valid fileUid.');
      }

      if (!isValid(bucketFile.bucketUid)) {
        bucketFile.bucketUid = this.configService.get(
          'CLAMAV_UNSCANNED_BUCKET',
        );
      }

      //check if file has already been scanned - record is in database
      const fileStatus = await this.prismaService.files.findFirst({
        where: {
          AND: [
            { bucketUid: bucketFile.bucketUid },
            { fileUid: bucketFile.fileUid },
          ],
        },
      });

      if (fileStatus) {
        //base64 bucketUid and fileUid
        const bucketUid64 = Buffer.from(bucketFile.bucketUid).toString(
          'base64',
        );
        const fileUid64 = Buffer.from(bucketFile.fileUid).toString('base64');

        throw new GoneException(
          `This file has already been submitted for scanning. Please check the status of the scan by GET /api/scan/${fileUid64}/${bucketUid64} or by GET /api/scan/${fileStatus.id}`,
        );
      }

      //check if file exists in minio
      const fileInfo = await this.minioClientService.fileExists(
        bucketFile.bucketUid,
        bucketFile.fileUid,
      );

      if (!fileInfo) {
        throw new NotFoundException(
          `This file: ${bucketFile.fileUid} does not exist in the bucket '${bucketFile.bucketUid}'. Please check if the bucketUid or fileUid is correct.`,
        );
      }

      const MAX_FILE_SIZE = this.configService.get('MAX_FILE_SIZE');
      if (fileInfo.size > MAX_FILE_SIZE) {
        throw new PayloadTooLargeException(
          `File size (${fileInfo.size}) exceeds the maximum allowed size (${MAX_FILE_SIZE}). Please check the file size.`,
        );
      }

      // TODO clamav has always octet stream as mime type on file. Needs to do other validation of mimetype in future.

      // get file format from bucketFile.fileUid
      const fileFormat = bucketFile.fileUid.split('.').pop();
      const proformaName = `proforma.${fileFormat}`;
      const mimeType = contentType(proformaName);
      if (this.isSupportedMimeType(<string>mimeType) === false) {
        throw new BadRequestException(
          `Unsupported file mime-type: ${mimeType}.`,
        );
      }

      try {
        const result = await this.prismaService.files.create({
          data: {
            bucketUid: bucketFile.bucketUid,
            fileUid: bucketFile.fileUid,
            fileSize: fileInfo.size,
            fileMimeType: <string>mimeType,
            status: FileStatus.ACCEPTED,
          },
        });

        return {
          status: 'ACCEPTED',
          id: result.id,
          fileUid: bucketFile.fileUid,
          message: `File: ${bucketFile.fileUid} has been successfully accepted for scanning.`,
        };
      } catch (error) {
        this.logger.error(error);
        throw new UnprocessableEntityException(
          `There was an error while saving the file to the database. Please try again later.`,
        );
      }
    }
  }

  public async scanFiles(
    bucketFiles: ScanFileDto[],
  ): Promise<ScanFileResponseDto[]> {
    //check if bucketFiles is an array
    if (!Array.isArray(bucketFiles)) {
      throw new BadRequestException('Please provide an array of files!');
    }

    //check if bucketFiles array is empty
    if (bucketFiles.length === 0) {
      throw new BadRequestException('Please provide at least one file!');
    }

    //check if bucketFiles array contains more than 20 files
    const maxFiles: number = +this.configService.get('MAX_FILES_PER_REQUEST');
    if (bucketFiles.length > maxFiles) {
      throw new PayloadTooLargeException(
        `Please provide a maximum of ${maxFiles} files!`,
      );
    }

    const scanFileResponseDto: ScanFileResponseDto[] = [];

    //loop through bucketFiles array bucketFiles of files
    for (const bucketFile of bucketFiles) {
      //check naming convention of fileUid
      let result: ScanFileResponseDto;
      try {
        result = await this.scanFile(bucketFile);
      } catch (error) {
        result = {
          status: error.name,
          fileUid: bucketFile.fileUid,
          id: null,
          message: error.message,
        };
      }
      scanFileResponseDto.push(result);
    }

    return scanFileResponseDto;
  }

  //function which returns scanner status by fileUid from prisma
  public async getStatus(
    bucketUid64: string,
    fileUid64: string,
  ): Promise<ScanStatusDto> {
    //check if fileUid64 and bucketUid64 are valid base64 strings
    if (!isBase64(bucketUid64) || !isBase64(fileUid64)) {
      throw new BadRequestException(
        'Base64 of bucketUid or fileUid is not correct.',
      );
    }
    const bucketUid = Buffer.from(bucketUid64, 'base64').toString('ascii');
    const fileUid = Buffer.from(fileUid64, 'base64').toString('ascii');

    if (!isValid(bucketUid) && !isValid(fileUid)) {
      throw new BadRequestException(
        'Please provide a valid bucketUid and fileUid.',
      );
    }

    try {
      return await this.prismaService.files.findFirstOrThrow({
        where: {
          AND: [{ bucketUid: bucketUid }, { fileUid: fileUid }],
        },
      });
    } catch (error) {
      throw new NotFoundException(
        `This file: ${fileUid} has not been submitted for scanning. Please submit the file for scanning by POST /api/scan.`,
      );
    }
  }

  public async getStatusByResourceId(
    resourceId: string,
  ): Promise<ScanStatusDto> {
    if (!isDefined(resourceId)) {
      throw new BadRequestException('Please provide a valid id');
    }

    try {
      return await this.prismaService.files.findUniqueOrThrow({
        where: { id: resourceId },
      });
    } catch (error) {
      throw new NotFoundException(
        `This file with id: ${resourceId} has not been submitted for scanning. Please submit the file for scanning by POST /api/scan.`,
      );
    }
  }

  //delete file from database
  public async deleteFile(resourceId: string): Promise<ScanStatusDto> {
    if (!isDefined(resourceId)) {
      throw new BadRequestException('Please provide a valid id');
    }

    this.logger.debug(
      `Received request for deletion of file with id: ${resourceId}`,
    );

    let file;
    try {
      file = await this.prismaService.files.findUniqueOrThrow({
        where: { id: resourceId },
      });
    } catch (error) {
      throw new UnprocessableEntityException(
        `There was an error with searching for the file.`,
      );
    }

    if (!file) {
      throw new NotFoundException(
        `This file with id: ${resourceId} has not been submitted for scanning. Please submit the file for scanning by POST /api/scan.`,
      );
    }

    try {
      return await this.prismaService.files.delete({
        where: { id: resourceId },
      });
    } catch (error) {
      throw new UnprocessableEntityException(
        `There was an issue deleting file: ${resourceId} from the database.`,
      );
    }
  }
}
