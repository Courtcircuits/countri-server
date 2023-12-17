import Room from "App/Models/Room";
import Transaction from "App/Models/Transaction";
import User from "App/Models/User";

class RoomService {
    public async destroy({ room_id, user_id }) {
        const room = await Room.findOrFail(room_id);
        const user = await User.findOrFail(user_id);

        if (!await this.checkIfInRoom(user_id, room)) {
            throw new Error("User not in room");
        }

        await room.delete();
    }
    public async checkIfInRoom(user_id: number, room_id: Room);
    public async checkIfInRoom(user_id: number, room_id: number);
    public async checkIfInRoom(user_id: any, room_id: any): Promise<boolean> {
        let room: Room;
        if (typeof room_id === "number") {
            try {
                room = await Room.findOrFail(room_id);
            } catch (e) {
                return false;
            }
        } else {
            room = room_id;
        }
        const check = await room.related('users').query().where('user_id', user_id);
        if (check.length === 0) {
            return false;
        }
        return true;
    }

    public async createTransaction({ room_id, amount, title, type, sender_id, target_user_id }) : Promise<Transaction> {
        if (!await this.checkIfInRoom(sender_id, room_id)) {
            throw new Error("User not in room");
        }
        if (!await this.checkIfInRoom(target_user_id, room_id)) {
            throw new Error("Target user not in room");
        }

        let create_transaction: Transaction;
        if (type === "debt"){
            create_transaction = await Transaction.create({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: target_user_id,
                receiver_id: sender_id
            });
        }else {
            create_transaction = await Transaction.create({
                room_id: room_id,
                amount: amount,
                title: title,
                type: type,
                sender_id: sender_id,
                receiver_id: target_user_id
            });
        }

        return create_transaction;
    }


}

export default new RoomService()