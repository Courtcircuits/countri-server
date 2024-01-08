import Room from "App/Models/Room";
import Transaction from "App/Models/Transaction";
import User from "App/Models/User";

class RoomService {
  public async destroy({ room_id, user_id }) {
    const room = await Room.findOrFail(room_id);

    if (!await this.checkIfInRoom(user_id, room)) {
      throw new Error("User not in room");
    }
    await room.delete();
  }

  public async getDetails(room_id: number, user_id: number): Promise<{
    room_id: number,
    name: string,
    sold: number,
    members: {
      name: string,
      avatar: string,
    }[]
  }> {
    const room = await Room.findOrFail(room_id);
    let debts: Transaction[];
    let gifts: Transaction[];
    try {
      debts = await room.related('transactions').query().where('receiver_id', user_id)
      gifts = await room.related('transactions').query().where('sender_id', user_id)
    } catch (e) {
      console.log(e);
      debts = [];
      gifts = [];
    }
    console.log(debts, gifts)
    const sum_debts = debts.reduce((a, b) => a + b.amount, 0) - gifts.reduce((a, b) => a + b.amount, 0);
    const members = await room.related('users').query();
    return {
      room_id: room.id,
      name: room.name,
      sold: sum_debts,
      members: members.map((member) => {
        return {
          name: member.name,
          avatar: member.profile_picture,
        }
      })
    };
  }

  public async getAllDetails(user_id: number) {
    const user = await User.findOrFail(user_id);
    const rooms = await user.related('rooms').query();
    console.log(rooms);
    if (!rooms || rooms.length === 0) {
      return [];
    }
    const rooms_details = await Promise.all(rooms.map(async (room) => {
      return await this.getDetails(room.id, user_id);
    }));
    return rooms_details;
  }

  public async checkIfInRoom(user_id: number, room_id: Room);
  public async checkIfInRoom(user_id: number, room_id: number);
  public async checkIfInRoom(user_id: any, room_id: any): Promise<boolean> {
    let room: Room;
    console.log(typeof room_id);
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

  public async createTransaction({ room_id, amount, title, type, sender_id, target_user_id }): Promise<Transaction> {
    room_id = parseInt(room_id);
    if (!await this.checkIfInRoom(sender_id, room_id)) {
      throw new Error("User not in room");
    }
    if (!await this.checkIfInRoom(target_user_id, room_id)) {
      throw new Error("Target user not in room");
    }

    let create_transaction: Transaction;
    if (type === "debt") {
      create_transaction = await Transaction.create({
        roomId: room_id,
        amount: amount,
        title: title,
        type: type,
        sender_id: target_user_id,
        receiver_id: sender_id
      });
    } else {
      create_transaction = await Transaction.create({
        roomId: room_id,
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
