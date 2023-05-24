import { Client } from 'minio'

export const region = "us-east-1"
export const bucketName = "calmav-unscanned-bucket"

/*
https://www.npmjs.com/package/minio
TODO just for dev, likely to be replaced by slightly different approach
TODO replace with a more restrictive key, this one limits it just to the bucket but allows all operations
 */
const minioClient = new Client({
  endPoint: 'cdn-api.bratislava.sk',
  port: 443,
  useSSL: true,
  // eslint-disable-next-line no-secrets/no-secrets
  secretKey: 'nRcXzl7zbO9jjt4dotpXJ011OtL8d8kj',
  accessKey: 'FORMS_DEV'
})

export default minioClient
