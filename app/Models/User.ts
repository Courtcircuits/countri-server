import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Room from './Room'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public profile_picture: string

  @manyToMany(() => Room, {
    pivotTable: 'room_user'
  })
  public rooms: ManyToMany<typeof Room>

  @column.dateTime()
  public createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  public updatedAt: DateTime
}