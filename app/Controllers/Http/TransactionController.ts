import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from 'App/Models/Transaction';
import { checkIfInRoom } from 'App/Utils/room_utils';

export default class TransactionController {
    public async create(ctx: HttpContextContract) {
        await ctx.auth.use('api').authenticate();
        const user = ctx.auth.use('api').user;
        if (!user) {
            return {
                message: 'user not found',
                data: []
            };
        }

        let room_id: number;
        let target_user_id: number;

        try {
            room_id = parseInt(ctx.request.input('room_id'));
        } catch (e) {
            return {
                message: 'room_id not found',
                data: []
            };
        }

        const amount = ctx.request.input('amount');
        const title = ctx.request.input('title');
        const type = ctx.request.input('type');
        try {
            target_user_id = parseInt(ctx.request.input('target_user_id'));
        } catch (e) {
            return {
                message: 'target_user_id not found',
                data: []
            };
        }

        if (!await checkIfInRoom(user.user_id, room_id)) {
            return {
                message: 'user not in room',
                data: []
            };
        }
        if (!await checkIfInRoom(target_user_id, room_id)) {
            return {
                message: 'target user not in room',
                data: []
            };
        }

        let create_transaction: Transaction;

        if (type === "debt") { // in this case the user is the receiver and the target_user is the sender
            create_transaction = await Transaction.create({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: target_user_id,
                receiver_id: user.user_id,
            });
        } else {
            create_transaction = await Transaction.create({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: user.user_id,
                receiver_id: target_user_id,
            });
        }

        return {
            message: 'transaction created',
            transaction: create_transaction.toJSON()
        };
    }
}