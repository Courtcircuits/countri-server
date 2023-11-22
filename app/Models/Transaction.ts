import { DateTime } from 'luxon'
import { BaseModel, HasOne, beforeCreate, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Room from './Room'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public room_id: number

  @hasOne(() => Room)
  public room: HasOne<typeof Room>

  @column()
  public receiver_id: number

  @column()
  public sender_id: number

  @hasOne(() => User)
  public receiver: HasOne<typeof User>

  @hasOne(() => User)
  public sender: HasOne<typeof User>

  @column()
  public amount: number

  @column()
  public title: string

  @column()
  public type: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async mapType (model: Transaction) {
    model.type = model.type != "debt" ? "credit" : "debt"
  }
}
