import { Client } from 'minio'

export const region = "us-east-1"
// export const bucketName = "forms-dev"
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
  secretKey: 'nRcXzl7zbO9jjt4dotpXJ011OtL8d8kj', /* bucketName = calmav-unscanned-bucket */
  accessKey: 'FORMS_DEV'/* bucketName = calmav-unscanned-bucket */
  // eslint-disable-next-line no-secrets/no-secrets
  // secretKey: 'cfB1t2jBVi39fHT5Mxae3gz70b8TBbDh' /* bucketName = forms-dev */
  // accessKey: 'FORMS_DEV_ALL', /* bucketName = forms-dev */
})

export default minioClient
