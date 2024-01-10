import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, beforeCreate, column, hasMany, manyToMany, hasOne, HasOne} from '@ioc:Adonis/Lucid/Orm'
import { randomUUID } from 'node:crypto'
import Transaction from './Transaction'
import User from './User'
import Invite from './Invite'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @column()
  public room_id: number

  @column()
  public receiver_id: number

  @column()
  public admin_id: number

  @hasOne(() => User,{
    foreignKey: 'admin_id'
  })
  public admin: HasOne<typeof User>

  @column()
  public sender_id: number

  @manyToMany(() => User, {
    pivotTable: 'room_user'
  })
  public users: ManyToMany<typeof User>

  @hasMany(() => Invite)
  public invites: HasMany<typeof Invite>

  @column()
  public invite_code: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid (model: Room) {
    model.invite_code = randomUUID()
  }
}
