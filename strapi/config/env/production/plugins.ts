export default ({ env }) => ({
  upload: {
    config: {
      // Docs: https://github.com/strapi/strapi/tree/main/packages/providers/upload-aws-s3
      provider: 'aws-s3',
      providerOptions: {
        // This is how we set up "subdomain" style of urls, e.g. "bucket-name.s3.bratislava.sk/..."
        baseUrl: env('MINIO_PUBLIC_ENDPOINT'),
        // Works like a folder, https://forum.strapi.io/t/how-to-specify-the-folder-for-strapi-provider-upload-aws-s3-plugin/30805/2
        rootPath: 'upload',
        s3Options: {
          credentials: {
            accessKeyId: env('MINIO_ACCESS_KEY'),
            secretAccessKey: env('MINIO_SECRET_KEY'),
          },
          // https://github.com/strapi/strapi/issues/19299#issuecomment-2885165824
          region: env('MINIO_AUTO_REGION'),
          endpoint: env('MINIO_PRIVATE_ENDPOINT'),
          params: {
            Bucket: env('MINIO_BUCKET'),
          },
        },
      },
    },
  },
})
