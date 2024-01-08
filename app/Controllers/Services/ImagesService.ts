import Env from '@ioc:Adonis/Core/Env'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'

class ImagesService {
  public async uploadImage(file: MultipartFileContract): Promise<string> {
    const file_name = `${new Date().getTime()}.${file.extname}`
    await file.moveToDisk('images', {
      name: file_name,
    }, 's3')
    return `${Env.get('S3_ENDPOINT')}/${Env.get('S3_BUCKET')}/images/${file_name}`
  }
}

export default new ImagesService()
