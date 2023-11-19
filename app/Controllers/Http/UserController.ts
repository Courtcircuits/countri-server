import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

export default class UserController {
    public async index(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate()
        const all = await Database.from('users').select('*')
        return {
            message: 'Hello world from UserController',
            data: all
        }
    }

    public async login(ctx: HttpContextContract) {
        const email = ctx.request.input('email')
        const password = ctx.request.input('password')

        const tokens = await ctx.auth.use('api').attempt(email, password)
        return {
            data: tokens
        }
    }

    public async register(ctx: HttpContextContract) {
        const email = ctx.request.input('email')
        const password = ctx.request.input('password')
        const username = ctx.request.input('username')

        const user_id_data = await Database.table('users').insert({
            name: username,
        }).returning('user_id')

        const local_user = await User.create({
            email: email,
            password: password,
        })

        const user_federal_auth = await Database.table('federal_credentials').insert({
            user_id: user_id_data[0].user_id,
            auth_user_id: local_user.$attributes.id,
            auth_provider: 'local',
        }).returning('id')

        return {
            data: {
                user_id: user_id_data[0],
                email: email,
                password: password,
                federal_id: user_federal_auth[0]
            }
        }
    }
}