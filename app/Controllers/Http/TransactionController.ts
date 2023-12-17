import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RoomService from '../Services/RoomService';
import { inject } from '@adonisjs/core/build/standalone';

@inject([RoomService])
export default class TransactionController {
    private roomService = RoomService;
    public async create({ auth, request }: HttpContextContract) {
        const user = auth.use('api').user;
        if (!user) {
            return {
                message: 'user not found',
                data: []
            }
        }

        try {
            const transaction = await this.roomService.createTransaction({
                room_id: request.input('room_id'),
                amount: request.input('amount'),
                title: request.input('title'),
                type: request.input('type'),
                sender_id: user.user_id,
                target_user_id: request.input('target_user_id')
            });
            return {
                message: 'transaction created',
                transaction: transaction.toJSON()
            };
        } catch (e) {
            return {
                message: e.message,
                data: []
            }
        }
    }
}