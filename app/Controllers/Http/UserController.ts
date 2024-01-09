import { inject } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ImagesService from '../Services/ImagesService'
import UserService from '../Services/UserService'

@inject([UserService, ImagesService])
export default class UserController {
  private userService = UserService
  private imagesService = ImagesService

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
    } catch (e) {
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

    try {
      const rooms = await this.userService.listRooms(user.id)
      return {
        message: 'rooms found',
        data: rooms
      }
    } catch (e) {
      return {
        message: 'rooms not found',
        data: []
      }
    }
  }

  public async list({ request, auth }: HttpContextContract) {
    const user_id = auth.use('api').user?.id || 0
    const list = await this.userService.listUsers(request.input('q'), user_id)
    return {
      data: list
    }
  }

  public async updateProfilePicture({ request, auth, response }: HttpContextContract) {
    const user_id = auth.use('api').user?.id || 0
    const user_email = auth.use('api').user?.email || ''
    const coverImage = request.file('profile_picture', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg']
    });
    if (!coverImage) {
      response.status(400)
      return {
        message: 'file not found',
        data: []
      }
    }

    if (!coverImage.isValid) {
      response.status(400)
      return {
        message: 'invalid file',
        data: []
      }
    }
    let url: string = '';
    try {
      url = await this.imagesService.uploadImage(coverImage)
    } catch (e) {
      console.log(e)
      response.status(500)
      return {
        message: 'error uploading image',
        data: []
      }
    }
    console.log(url)
    try {

      const user = await this.userService.updateProfilePicture(user_id, user_email, url)
      return {
        message: 'profile picture updated',
        data: user
      }

    } catch (e) {
      console.log(e)
      response.status(500)
      return {
        message: 'error updating profile picture',
        data: []
      }
    }
  }


  public async updateName({ request, auth, response }: HttpContextContract) {
    const user_id = (await auth.use('api').user?.related('user').query().first())?.id || 0
    const user_email = auth.use('api').user?.email || ''
    const name = request.input('name')
    console.log('new name', name)
    try {
      const user = await this.userService.updateName(user_id, user_email, name)
      return {
        message: 'name updated',
        data: user
      }
    } catch (e) {
      console.log(e)
      response.status(500)
      return {
        message: 'error updating name',
        data: []
      }
    }
  }


  public async updateEmail({ request, auth, response }: HttpContextContract) {
    const user_id = auth.use('api').user?.id || 0
    const email = request.input('email')
    try {
      const user = await this.userService.updateEmail(user_id, email)
      return {
        message: 'email updated',
        data: user
      }
    } catch (e) {
      console.log(e)
      response.status(500)
      return {
        message: 'error updating email',
        data: []
      }
    }
  }
}
