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
    const coverImage = request.file('profile_picture');
    if (!coverImage) {
      return {
        message: 'file not found',
        data: []
      }
    }
    const path = `profile_pictures/${user_id}/${coverImage.clientName.split(' ').join('_')}`
    let url: string = '';
    try {
      url = await this.imagesService.uploadImage(coverImage, path)
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
}
