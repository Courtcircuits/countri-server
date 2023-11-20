import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';

export default class TransactionController {
    public async checkIfInRoom(user_id: number, room_id: number):Promise<boolean> {
        const check = await Database.from('room_user').where('user_id', user_id).andWhere('room_id', room_id);
        if (check.length === 0) {
            return false;
        }
        return true;
    }

    public async create(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate();
        const user = ctx.auth.use('api').user;
        if (!user) {
            return {
                message: 'user not found',
                data: []
            };
        }

        const room_id = ctx.request.input('room_id');
        const amount = ctx.request.input('amount');
        const title = ctx.request.input('title');
        const type = ctx.request.input('type');
        const target_user_id = ctx.request.input('target_user_id');

        if(!await this.checkIfInRoom(user.id, room_id)) {
            return {
                message: 'user not in room',
                data: []
            };
        }

        let create_transaction;

        if (type === "Debt") { // in this case the user is the receiver and the target_user is the sender
            create_transaction = await Database.table('transaction').insert({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: target_user_id,
                receiver_id: user.id,
            }).returning('transaction_id');
        } else {
            create_transaction = await Database.table('transaction').insert({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: user.id,
                receiver_id: target_user_id,
            }).returning('transaction_id');
        }

        return {
            message: 'transaction created',
            data: create_transaction
        };
    }
}