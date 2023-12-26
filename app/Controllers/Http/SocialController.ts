
import { AllyUserContract, GoogleToken } from '@ioc:Adonis/Addons/Ally'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthUser from 'App/Models/AuthUser';
import User from 'App/Models/User';
import Env from '@ioc:Adonis/Core/Env'

export default class SocialController {
    public async redirect({ ally }: HttpContextContract) {
        return ally.use('google').redirect()
    }
    public async callback({ ally, auth, response }: HttpContextContract) {
        const google = ally.use('google')
        let google_user: AllyUserContract<GoogleToken>;
        try {
            google_user = await google.user()
        } catch (error) {
            console.log(error)
            return 'Unable to authenticate. Try again later.'
        }

        if (!google_user.email || !google_user.name || !google_user.avatarUrl) {
            return 'Unable to authenticate. Try again later.'
        }

        const user = await User.firstOrCreate({
            name: google_user.name,
            profile_picture: google_user.avatarUrl,
        }, {
            name: google_user.name,
            profile_picture: google_user.avatarUrl,
        })

        const auth_user = await AuthUser.firstOrCreate({
            email: google_user.email,
        }, {
            email: google_user.email,
            provider: 'google',
            password: '',
            user_id: user.id,
        })
        const opaqueToken = await auth.use('api').login(auth_user, {
            expiresIn: '30days',
        })

        response.cookie('token', opaqueToken.token)

        return response.redirect(Env.get('FRONTEND_URL') + '/dashboard')
    }
}
