import graphqlConfig from './plugins.graphql.config'
import configSyncConfig from './plugins.config-sync.config'

export default {
  graphql: {
    config: graphqlConfig,
  },
  'config-sync': {
    config: configSyncConfig,
  },
}
