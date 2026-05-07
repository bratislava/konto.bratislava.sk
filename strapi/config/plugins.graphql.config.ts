const graphqlConfig = {
  generateArtifacts: true,
  artifacts: {
    // When changing schema path, also change watchIgnoreFiles in strapi/config/admin.js
    // GRAPHQL_SCHEMA_ARTIFACT_PATH is used by scripts/generate-graphql-schema.js
    schema: process.env.GRAPHQL_SCHEMA_ARTIFACT_PATH ?? true,
  },
  defaultLimit: 100,
}

export default graphqlConfig
