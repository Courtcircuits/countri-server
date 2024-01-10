import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import Room from 'App/Models/Room';
import AuthUser from 'App/Models/AuthUser';
import { checkIfInRoom } from 'App/Utils/room_utils';
import Transaction from 'App/Models/Transaction';
import { inject } from '@adonisjs/core/build/standalone';
import RoomService from '../Services/RoomService';

@inject([RoomService])
export default class RoomController {
  private roomService = RoomService;

  public async get(ctx: HttpContextContract) {
    const user = ctx.auth.user;
    if (!user) {
      return {
        message: 'user not found',
        data: []
      };
    }
    let room_id: number;
    try {
      room_id = ctx.params.id;
    } catch (e) {
      ctx.response.status(400);
      return {
        message: 'room_id not found',
        data: []
      };
    }

    const toReturn: {
      name: string,
      id: string,
      isAdmin: boolean,
      members: {
        name: string,
        id: string,
        profile_picture: string,
      }[],
      transactions: {
        amount: number,
        date: string,
        receiver: string,
        sender: string,
        title: string,
      }[]
    } = {
      name: "",
      id: "0",
      isAdmin: false,
      members: [],
      transactions: []
    }

    let room: Room;
    try {
      room = await Room.findOrFail(room_id);
    } catch (e) {
      ctx.response.status(404);
      return {
        message: 'room not found',
        data: []
      };
    }

    if (!await checkIfInRoom(user.user_id, room)) {
      ctx.response.status(400);
      return {
        message: 'user not in room',
        data: []
      };
    }

    toReturn.name = room.name;
    toReturn.id = room.id.toString();

    const users = await room.related('users').query().where('room_id', room_id);
    toReturn.members = users.map((user) => {
      return {
        name: user.name,
        id: user.id.toString(),
        profile_picture: user.profile_picture
      }
    });

    let transactions: Transaction[];
    try {
      transactions = await Transaction.query().where('room_id', room_id);
    } catch (e) {
      console.log(e);
      return toReturn;
    }

    for (const transaction of transactions) {
      const receiver = await User.findOrFail(transaction.receiver_id);
      const sender = await User.findOrFail(transaction.sender_id);

      toReturn.transactions.push({
        amount: transaction.amount,
        date: transaction.createdAt.toString(),
        receiver: receiver.name,
        sender: sender.name,
        title: transaction.title,
      });
    }
    toReturn.transactions.sort((a, b) => {
      return Date.parse(b.date) - Date.parse(a.date);
    });
    toReturn.isAdmin = room.admin_id === user.user_id;
    return toReturn;
  }

  public async getInviteCode(ctx: HttpContextContract) {
    await ctx.auth.use('api').authenticate();
    const user = ctx.auth.use('api').user;
    if (!user) {
      return {
        message: 'user not found',
        data: []
      };
    }
    const room_id = ctx.params.id
    let invite_code: string;

    try {
      const user_orm = await User.findOrFail(user.user_id);
      invite_code = (await user_orm.related('rooms').query().where('rooms.id', room_id))[0].invite_code;
    } catch (e) {
      console.log(e);
      return {
        message: 'room not found',
        data: []
      };
    }

    return {
      message: 'invite code found',
      invite_code: invite_code
    };
  }

  /**
   *
   * @param room a room orm object
   * @param user_id the id of the user /!\ not the auth_user id
   */
  public async joinRoom(room: number, user_id: number);
  public async joinRoom(room: Room, user_id: number);
  public async joinRoom(room: any, user_id: any): Promise<boolean> {
    let room_orm: Room;
    if (typeof room === "number") {
      try {
        room_orm = await Room.findOrFail(room);
      } catch (e) {
        return false;
      }
    } else {
      room_orm = room;
    }
    await room_orm.related('users').attach([user_id]);
    return true;
  }

  public async create({ auth, response, request }: HttpContextContract) {
    await auth.use('api').authenticate();
    const user = auth.use('api').user;
    const user_id = user?.user_id;
    if (!user_id) {
      response.status(401);
      return {
        message: 'user not found',
        data: []
      };
    }

    const room_name = request.input('name');

    const created_room = await Room.create({
      name: room_name,
      admin_id: user_id,
    });


    const hasBeenCreated = await this.joinRoom(created_room, user_id);

    if (!hasBeenCreated) {
      response.status(500);
      return {
        message: 'room not created',
        room: []
      };
    }

    return {
      message: 'room created',
      room: created_room.toJSON()
    };
  }

  public async getAllTransactions(ctx: HttpContextContract) {
    await ctx.auth.use('api').authenticate();
    let room_id: number;
    try {
      room_id = parseInt(ctx.params.id);
    } catch (e) {
      ctx.response.status(400);
      return {
        message: 'room_id not found',
        data: []
      };
    }
    const user: AuthUser | undefined = ctx.auth.use('api').user;

    if (!user) {
      ctx.response.status(401);
      return {
        message: 'user not found',
        data: []
      };
    }

    if (!await checkIfInRoom(user.user_id, room_id)) {
      ctx.response.status(400);
      return {
        message: 'user not in room',
        data: []
      };
    }

    let transactions: Transaction[];

    try {
      transactions = await Transaction.query().where('room_id', room_id);
    } catch (e) {
      ctx.response.status(404);
      return {
        message: 'room not found',
        data: []
      };
    }
    if (transactions.length === 0) {
      ctx.response.status(404);
      return {
        message: 'no transactions found',
        data: []
      };
    }
    return {
      message: 'transactions found',
      data: transactions
    };
  }

  public async update({ params, response, request }) {
    let room_id: number;
    try {
      room_id = parseInt(params.id);
    } catch (e) {
      response.status(500);
      return {
        message: 'room id is not a number',
      };
    }

    const room_name = request.input('name');
    try {
      const room = await Room.findOrFail(room_id)
      room.name = room_name;
      await room.save();
    } catch (e) {
      response.status(404);
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
    let room_id: number;
    try {
      room_id = parseInt(ctx.request.input('room_id'));
    } catch (e) {
      ctx.response.status(400);
      return {
        message: 'room_id not found',
      };
    }
    const user = ctx.auth.use('api').user;
    let user_id: number | null;
    if (!user) { // join is also used for creating room so we need to check if user is logged in or not
      user_id = (await ctx.auth.use('api').authenticate()).user_id;
    } else {
      user_id = user.id;
    }

    if (!user_id) {
      ctx.response.status(401);
      return {
        message: 'user not found',
        data: []
      };
    }

    let hasBeenCreated: boolean;
    try {
      hasBeenCreated = await this.joinRoom(room_id, user_id);
    } catch (e) {
      ctx.response.status(400);
      return {
        message: 'room already joined',
      };
    }

    if (!hasBeenCreated) {
      ctx.response.status(500);
      return {
        message: 'room not joined',
      };
    }
    return {
      message: 'room joined',
    };
  }

  public async getUsers(ctx: HttpContextContract) {
    await ctx.auth.use('api').authenticate();
    const user = ctx.auth.use('api').user;

    if (!user) {
      return {
        message: 'user not found',
        data: []
      };
    }

    let room: Room;

    try {
      room = await Room.findOrFail(ctx.params.id);
    } catch (e) {
      ctx.response.status(404);
      return {
        message: 'room not found',
        data: []
      };
    }


    if (!await checkIfInRoom(user.user_id, room)) {
      ctx.response.status(400);
      return {
        message: 'user not in room',
        data: []
      };
    }

    const room_id = ctx.request.input('room_id');
    const users = await room.related('users').query().where('room_id', room_id);

    if (users.length === 0) {
      return {
        message: 'no users found',
        data: []
      };
    }
    return {
      message: 'users found',
      data: users
    };
  }

  // delete someone from a room
  public async leave({
    auth, response, params
  }) {
    await auth.use('api').authenticate();
    let room_id: number;
    try {
      room_id = parseInt(params.id);
    } catch (e) {
      response.status(500);
      return {
        message: 'room_id must be a number',
      };
    }

    let user_id: number;
    try {
      user_id = auth.use('api').user?.user_id as number;
    } catch (e) {
      response.status(500);
      return {
        message: 'user_id must be a number',
      };
    }

    let room: Room;

    try {
      room = await Room.findOrFail(room_id);
    } catch (e) {
      response.status(404);
      return {
        message: 'room not found',
        data: []
      };
    }

    if (!await checkIfInRoom(user_id, room)) {
      response.status(400);
      return {
        message: 'user not in room',
        data: []
      };
    }

    await room.related('users').detach([user_id]);

    return {
      message: 'user left room',
    };
  }

  public async destroy({ auth, params, response, bouncer }) {
    await auth.use('api').authenticate();
    const user_id = auth.use('api').user?.user_id as number;
    const room_id = params.id as number;

    try {
      const room = await Room.findOrFail(room_id);
      await bouncer.authorize('destroyRoom', room);
    } catch (e) {
      response.status(400);
      return {
        message: 'user not admin',
        data: []
      };
    }

    try {
      await this.roomService.destroy({ room_id, user_id });
    } catch (e) {
      response.status(500);
      return {
        message: e,
      };
    }

    return {
      message: 'room deleted',
    };
  }

  public async getAllDetails({ auth, response }: HttpContextContract) {
    await auth.use('api').authenticate();
    const user_id = auth.use('api').user?.user_id as number;

    try {
      return await this.roomService.getAllDetails(user_id);
    } catch (e) {
      response.status(500);
      return {
        message: e,
      };
    }
  }

  public async joinWithLink(ctx: HttpContextContract) {
    const invite_code = ctx.params.invite_code;
    const user = ctx.auth.use('api').user;
    let user_id: number | null;
    if (!user) { // join is also used for creating room so we need to check if user is logged in or not
      user_id = (await ctx.auth.use('api').authenticate()).user_id;
    } else {
      user_id = user.id;
    }

    if (!user_id) {
      ctx.response.status(401);
      return {
        message: 'user not found',
        data: []
      };
    }

    let room: Room;

    try {
      room = await Room.findByOrFail('invite_code', invite_code);
    } catch (e) {
      ctx.response.status(404);
      return {
        message: 'room not found',
        data: []
      };
    }

    let hasBeenCreated: boolean;
    try {
      hasBeenCreated = await this.joinRoom(room, user_id);
    } catch (e) {
      ctx.response.status(400);
      return {
        message: 'room already joined',
      };
    }

    if (!hasBeenCreated) {
      ctx.response.status(500);
      return {
        message: 'room not joined',
      };
    }
    return {
      message: 'room joined',
    };
  }
}
