import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'

export default class SetAuthorizationHeader {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    const token = request.cookie('token')

    Logger.info("TOKEN de l'USER: ", token)

    if (token) {
      request.headers().authorization = `Bearer ${token}`
    }

    await next()
  }
}