import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const isAdmin = ctx.auth.user?.$extras.isAdmin

    if(!isAdmin) {
      return ctx.response.unauthorized({message: 'unauthorized'})
    }

    return await next()
  }
}
