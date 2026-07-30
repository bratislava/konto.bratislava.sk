import type { ApolloServerPlugin, BaseContext } from '@apollo/server'

const logVariables = process.env.STRAPI_LOG_GRAPHQL_VARIABLES === 'true'

const operationLoggerPlugin: ApolloServerPlugin<BaseContext> = {
  async requestDidStart() {
    const startedAt = process.hrtime.bigint()

    return {
      async willSendResponse(context) {
        if (context.operationName === 'IntrospectionQuery') {
          return
        }

        const durationMs = Number((process.hrtime.bigint() - startedAt) / BigInt(1_000_000))
        const operationType = context.operation?.operation ?? 'unknown'
        const operationName = context.operationName ?? 'anonymous'
        const errors =
          context.response.body.kind === 'single'
            ? context.response.body.singleResult.errors
            : undefined
        const status = errors && errors.length > 0 ? `errors=${errors.length}` : 'ok'

        const variablesSuffix =
          logVariables && Object.keys(context.request.variables ?? {}).length > 0
            ? ` variables=${JSON.stringify(context.request.variables)}`
            : ''

        strapi.log.info(
          `graphql: ${operationType} ${operationName} (${durationMs} ms) ${status}${variablesSuffix}`,
        )
      },
      async didEncounterErrors(context) {
        if (context.operationName === 'IntrospectionQuery') {
          return
        }
        for (const error of context.errors) {
          strapi.log.warn(
            `graphql: ${context.operationName ?? 'anonymous'} error: ${error.message}`,
          )
        }
      },
    }
  },
}

export default operationLoggerPlugin
