/* eslint-disable no-process-env */
import { Client } from 'minio'

export const region = 'us-east-1'
export const unscannedBucketName = process.env.MINIO_UNSCANNED_BUCKET || ''
export const safeBucketName = process.env.MINIO_SAFE_BUCKET || ''
export const infectedBucketName = process.env.MINIO_INFECTED_BUCKET || ''
/*
https://www.npmjs.com/package/minio
TODO just for dev, likely to be replaced by slightly different approach
TODO replace with a more restrictive key, this one limits it just to the bucket but allows all operations
 */
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '',
  port: parseInt(process.env.MINIO_ENDPOINT || '0', 10),
  useSSL: typeof process.env.MINIO_USE_SSL === 'boolean' ? process.env.MINIO_USE_SSL : true,
  // eslint-disable-next-line no-secrets/no-secrets
  secretKey: process.env.MINIO_SECRET_KEY || '',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
})

export default minioClient
