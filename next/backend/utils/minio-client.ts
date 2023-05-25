import { Client } from 'minio'

export const region = "us-east-1"
export const bucketName = process.env.NEXT_PUBLIC_MINIO_UNSCANNED_BUCKET || ''

/*
https://www.npmjs.com/package/minio
TODO just for dev, likely to be replaced by slightly different approach
TODO replace with a more restrictive key, this one limits it just to the bucket but allows all operations
 */
const minioClient = new Client({
  endPoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT || '',
  port: parseInt(process.env.NEXT_PUBLIC_MINIO_ENDPOINT || '0', 10),
  useSSL: typeof process.env.NEXT_PUBLIC_MINIO_USE_SSL === 'boolean'
    ? process.env.NEXT_PUBLIC_MINIO_USE_SSL
    : true,
  // eslint-disable-next-line no-secrets/no-secrets
  secretKey: process.env.NEXT_PUBLIC_MINIO_SECRET_KEY || '',
  accessKey: process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY || ''
})

export default minioClient
