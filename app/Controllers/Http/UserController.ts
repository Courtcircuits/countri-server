import { inject } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from '../Services/UserService'

@inject([UserService])
export default class UserController {
    private userService = UserService

    public async get(ctx: HttpContextContract) {
        const user_auth = ctx.auth.use('api').user
        if (!user_auth) {
            return {
                message: 'user not found',
                data: []
            }
        }

        try {
            const data = await this.userService.get(user_auth.user_id, user_auth.email)
            return {
                message: 'user found',
                data: data
            }
        }catch(e) {
            return {
                message: 'user not found',
                data: []
            }
        }
    }

    public async listRooms(ctx: HttpContextContract) {
        const user = await ctx.auth.use('api').user?.related('user').query().first()
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }

        try{
            const rooms = await this.userService.listRooms(user.id)
            return {
                message: 'rooms found',
                data: rooms
            }
        }catch(e) {
            return {
                message: 'rooms not found',
                data: []
            }
        }
    }

    public async list({request}: HttpContextContract){
      const list = await this.userService.listUsers(request.input('q'))
      return {
        data: list
      }
    }
}
