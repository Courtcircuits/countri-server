import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthenticationService from '../Services/AuthenticationService'
import { inject } from '@adonisjs/core/build/standalone'
import Logger from '@ioc:Adonis/Core/Logger'
import AuthUser from 'App/Models/AuthUser'
import User from 'App/Models/User'


@inject([AuthenticationService])
export default class AuthenticationController {
  private authenticationService = AuthenticationService

  public async logout(ctx: HttpContextContract) {
    const tokens = await ctx.auth.use('api').revoke()
    ctx.response.clearCookie('token')
    return {
      message: 'user found',
      data: tokens
    }
  }

  public async login({ request, auth, response }: HttpContextContract) {
    Logger.info('login')
    const email = request.input('email')
    const password = request.input('password')
    Logger.info(email)
    Logger.info(password)

    const tokens = await auth.use('api').attempt(email, password)
    response.cookie('token', tokens.token)
    const auth_user = auth.use('api').user
    const user = await auth_user?.related('user').query().first()
    if (!user) {
      return {
        message: 'user not found',
        data: []
      }
    }
    const rooms = await user.related('rooms').query()
    Logger.info(rooms.toString())

    if (!rooms || rooms.length === 0) {
      return {
        tokens: tokens,
        room: null
      }
    }

    return {
      tokens: tokens,
      room: rooms[0].id
    }
  }

  public async register(ctx: HttpContextContract) {
    const email = ctx.request.input('email')
    const password = ctx.request.input('password')
    const username = ctx.request.input('username')
    let user: User | null = null
    let auth_user: AuthUser | null = null

    try {
      const created_user = await this.authenticationService.createUser({
        email: email,
        password: password,
        username: username
      })
      user = created_user.user
      auth_user = created_user.auth_user
    } catch (e) {
      ctx.response.status(400)
      return {
        message: e.message,
        data: []
      }
    }

    if (!user || !auth_user) {
      ctx.response.status(400)
      return {
        message: 'user not found',
        data: []
      }
    }

    const tokens = await ctx.auth.use('api').generate(auth_user, {
      expiresIn: '30days'
    })

    ctx.response.cookie('token', tokens.token)

    return {
      data: {
        user_id: user.id,
        email: email,
        password: password,
        federal_id: auth_user.id,
      }
    }
  }
}
