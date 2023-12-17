import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthenticationService from '../Services/AuthenticationService'
import { inject } from '@adonisjs/core/build/standalone'

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

    public async login(ctx: HttpContextContract) {
        const email = ctx.request.input('email')
        const password = ctx.request.input('password')

        const tokens = await ctx.auth.use('api').attempt(email, password)
        ctx.response.cookie('token', tokens.token)
        const user = await (await ctx.auth.use('api').user)?.related('user').query().first()
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }
        const rooms = await user.related('rooms').query()
        
        return {
            tokens: tokens,
            room: rooms[0].id
        }
    }

    public async register(ctx: HttpContextContract) {
        const email = ctx.request.input('email')
        const password = ctx.request.input('password')
        const username = ctx.request.input('username')


        const {user, auth_user} = await this.authenticationService.createUser({
            email: email,
            password: password,
            username: username
        })

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