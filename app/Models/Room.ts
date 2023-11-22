import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, beforeCreate, column, hasMany, manyToMany} from '@ioc:Adonis/Lucid/Orm'
import { randomUUID } from 'node:crypto'
import Transaction from './Transaction'
import User from './User'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @manyToMany(() => User, {
    pivotTable: 'room_user'
  })
  public users: ManyToMany<typeof User>

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
