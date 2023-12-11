import { BaseModel, HasOne, beforeSave, column, hasOne } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import { DateTime } from "luxon";
import Room from "./Room";

export default class Invite extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public room_id: number

    @column()
    public sender_id: number

    @column()
    public receiver_id: number

    @column()
    public invite_code: string

    @hasOne(() => User)
    public sender: HasOne<typeof User>

    @hasOne(() => User)
    public receiver: HasOne<typeof User>

    @hasOne(() => Room)
    public room: HasOne<typeof Room>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeSave()
    public static async generateInviteCode(invite: Invite) {
        invite.invite_code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}