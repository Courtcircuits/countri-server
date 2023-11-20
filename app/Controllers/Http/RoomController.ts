import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class RoomController {
    public async create(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate();
        const user_id = ctx.auth.use('api').user?.id;
        if (!user_id) {
            return {
                message: 'user not found',
                data: []
            };
        }

        const room_name = ctx.request.input('name');
        const create_room = await Database.table('room').insert({
            title: room_name
        }).returning('room_id');

        ctx.request.updateBody({
            room_id: create_room[0].room_id
        });


        const join_room = await this.join(ctx);

        if (join_room.message !== 'room joined') {
            return {
                message: 'room not created',
                data: []
            };
        }

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

    public async join(ctx: HttpContextContract) {
        const room_id = ctx.request.input('room_id');
        const user = ctx.auth.use('api').user;
        let user_id: number  | null;
        if (!user) { // join is also used for creating room so we need to check if user is logged in or not
            user_id = (await ctx.auth.use('api').authenticate()).id;
        }else {
            user_id = user.id; 
        }

        if (!user_id) {
            return {
                message: 'user not found',
                data: []
            };
        }

        let join_room;

        try {
            join_room = await Database.table('belong_to_room').insert({
                room_id: room_id,
                user_id: user_id
            }).returning('room_id');


        } catch (e) {
            if (e.code === '23505') {
                return {
                    message: 'user already joined',
                    data: []
                };
            }
            console.log(e);
            return {
                message: 'room not found',
                data: []
            };
        }

        return {
            message: 'room joined',
            data: join_room
        };
    }
}   