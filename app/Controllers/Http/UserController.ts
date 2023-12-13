import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import AuthUser from 'App/Models/AuthUser'
import User from 'App/Models/User'

export default class UserController {

    public async logout(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate()
        const user = await (await ctx.auth.use('api').user)?.related('user').query().first()
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }
        const tokens = await ctx.auth.use('api').revoke()
        ctx.response.clearCookie('token')
        return {
            message: 'user found',
            data: tokens
        }
    }

    public async index(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate()
        const all = await Database.from('users').select('*')
        return {
            message: 'Hello world from UserController',
            data: all
        }
    }

    public async get(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate()
        const user_auth = await (await ctx.auth.use('api').user)
        const user = await user_auth?.related('user').query().first()
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }
        const rooms = await user.related('rooms').query()
        return {
            message: 'user found',
            data: {
                id: user.id,
                name: user.name,
                profile_picture: user.profile_picture,
                email: user_auth?.email,
                rooms: rooms.map((room) => {
                    return {
                        id: room.id.toString(),
                        name: room.name
                    }
                })
            }
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

        const user = await User.create({
            name: username
        })

        const local_user = await AuthUser.create({
            email: email,
            password: password,
            provider: 'local',
            user_id: user.id,
        })

        const tokens = await ctx.auth.use('api').generate(local_user, {
            expiresIn: '30days'
        })

        ctx.response.cookie('token', tokens.token)

        return {
            data: {
                user_id: user.id,
                email: email,
                password: password,
                federal_id: local_user.id,
            }
        }
    }

    public async listRooms(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate()
        const user = await (await ctx.auth.use('api').user)?.related('user').query().first()
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }
        const rooms = await user.related('rooms').query()
        return {
            message: 'rooms found',
            data: rooms.map((room) => {
                return {
                    id: room.id,
                    name: room.name
                }
            }
            )
        }
    }
}