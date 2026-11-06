import operationLoggerPlugin from '../src/apollo/operationLoggerPlugin'

const graphqlConfig = {
  generateArtifacts: true,
  artifacts: {
    // When changing schema path, also change watchIgnoreFiles in strapi/config/admin.js
    schema: true,
  },
  defaultLimit: 100,
  apolloServer: {
    plugins: [operationLoggerPlugin],
  },
}

export default graphqlConfig
