import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class AuthUser extends BaseModel {
  public static table = 'auth_users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @hasOne(() => User)
  public user: HasOne<typeof User>

  @column({ serializeAs: null })
  public password: string 

  @column()
  public email: string

  @column()
  public rememberMeToken: string | null

  @column()
  public provider: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: AuthUser) {
    if (user.provider != 'local') {
      return
    }
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
