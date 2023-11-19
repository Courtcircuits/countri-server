import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class RoomController {
    public async create(ctx: HttpContextContract) {
        const room_name = ctx.request.input('name');
        const create_room = await Database.table('room').insert({
            title: room_name
        }).returning('room_id');
        return {
            message: 'room created',
            data: create_room
        };
    }

    public async update(ctx: HttpContextContract) {
        const room_id = ctx.request.input('room_id');
        const room_name = ctx.request.input('name');
        try {
            await Database.from('room').where('room_id', room_id).update({
                title: room_name
            });
        } catch (e) {
            return {
                message: 'room not found',
                data: []
            };
        }
        return {
            message: 'room updated',
            data: {
                room_id: room_id,
                title: room_name
            }
        };
    }
}