import { Injectable, Logger } from '@nestjs/common';
import { MinioClient, MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;

  constructor(private readonly minioService: MinioService) {
    this.logger = new Logger('MinioClientService');
  }

  public async client(): Promise<MinioClient> {
    this.logger.log('MinioClientService.client');
    return this.minioService.client;
  }

  //function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string) {
    try {
      await this.minioService.client.bucketExists(bucketName);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which loads file stream from minio bucket
  public async loadFileStream(bucketName: string, fileName: string) {
    return await this.minioService.client.getObject(bucketName, fileName);
  }

  //function which lists all files in minio bucket
  public async listFiles(bucketName: string) {
    try {
      const files = await new Promise((resolve, reject) => {
        const objectsListTemp = [];
        const stream = this.minioService.client.listObjectsV2(
          bucketName,
          '',
          true,
          '',
        );

        stream.on('data', (obj) => objectsListTemp.push(obj.name));
        stream.on('error', reject);
        stream.on('end', () => {
          resolve(objectsListTemp);
        });
      });

      return files;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //FIXME promise
  //function which checks if file exists in minio bucket
  public async fileExists(bucketName: string, fileName: string): Promise<any> {
    try {
      return await this.minioService.client.statObject(bucketName, fileName);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  //function which moves file from one bucket to another
  public async moveFileBetweenBuckets(
    sourceBucketName: string,
    sourceFileName: string,
    destinationBucketName: string,
    destinationFileName: string,
  ) {
    const conds = this.minioService.copyConditions;

    this.logger.debug(
      `Moving file ${sourceFileName} from bucket ${sourceBucketName} to bucket ${destinationBucketName} with name ${destinationFileName}`,
    );

    try {
      await this.minioService.client.copyObject(
        destinationBucketName,
        destinationFileName,
        `/${sourceBucketName}/${sourceFileName}`,
        conds,
      );
    } catch (error) {
      this.logger.error(
        `Error while moving file ${sourceFileName} from bucket ${sourceBucketName} to bucket ${destinationBucketName} with name ${destinationFileName}. Error: ${error}`,
      );
      return false;
    }

    try {
      await this.minioService.client.removeObject(
        sourceBucketName,
        sourceFileName,
      );
    } catch (error) {
      this.logger.error(
        `Error while removing file ${sourceFileName} from bucket ${sourceBucketName}. Error: ${error}`,
      );
      return false;
    }

    return true;
  }
}
