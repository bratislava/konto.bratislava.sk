import type { Core } from '@strapi/types'

const logger: Core.MiddlewareFactory = (_, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now()
    await next()
    const delta = Math.ceil(Date.now() - start)

    if (ctx.url.startsWith('/graphql')) {
      return
    }

    strapi.log.http(`${ctx.method} ${ctx.url} (${delta} ms) ${ctx.status}`)
  }
}

export default logger
