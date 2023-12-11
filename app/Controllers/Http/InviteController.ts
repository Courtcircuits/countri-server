import AuthUser from "App/Models/AuthUser";
import Invite from "App/Models/Invite";
import Room from "App/Models/Room";
import User from "App/Models/User";

type InviteData = {
    room: string,
    sender: string,
    invite_code: string
}

export default class InviteController {
    public async create({ request, response, auth }) {
        const { room_id, receiver } = request.all();
        let invite: Invite;
        let receiver_id: number;
        const sender_id = auth.user.id;
        receiver_id = parseInt(receiver)
        console.log(receiver_id);
        if (isNaN(receiver_id)) {
            if (receiver.includes('@')) {
                try {
                    const user = await AuthUser.findByOrFail('email', receiver);
                    console.log(receiver);
                    receiver_id = user.user_id;
                } catch (e) {
                    console.log(e);
                    return response.json({ error: "Receiver not found" });
                }
            } else {
                return response.json({ error: "Receiver not found" });
            }
        }

        try {
            invite = await Invite.create({ room_id, sender_id, receiver_id });
        } catch (e) {
            console.log(e);
            return response.json({ error: "Error while creating invite" });
        }
        return response.json(invite);
    }

    public async join({ request, response, auth, params: { uuid } }) {
        console.log(uuid);
        const sender_id = auth.user.id;
        let invite: Invite;
        try {
            invite = await Invite.findByOrFail('invite_code', uuid)
        } catch (e) {
            console.log(e);
            response.status(404);
            return response.json({ error: "Not found" });
        }
        if (invite.receiver_id != sender_id) {
            response.status(403);
            return response.json({ error: "You are not the receiver of this invite" });
        }
        try {
            const room = await Room.findOrFail(invite.room_id);
            room?.related('users').attach([sender_id]);
            await invite.delete();
        } catch (e) {
            console.log(e);
            response.status(500);
            return response.json({ error: "Error while deleting invite" });
        }
        return response.json(invite);
    }

    public async delete({ request, response, auth, params: { uuid } }) {
        const user_id = auth.user.id;
        let invite: Invite;
        try {
            invite = await Invite.findByOrFail('invite_code', uuid)
        } catch (e) {
            console.log(e);
            response.status(404);
            return response.json({ error: "Not found" });
        }
        if (invite.sender_id != user_id) {
            response.status(403);
            return response.json({ error: "You are not the sender of this invite" });
        }
        try {
            await invite.delete();
        } catch (e) {
            console.log(e);
            response.status(500);
            return response.json({ error: "Error while deleting invite" });
        }
        return response.json(invite);
    }


    public async getAll({ request, response, auth }) {
        const user_id = auth.user.id;
        const invites = await Invite.query().where('receiver_id', user_id);
        let invites_data: InviteData[] = [];
        let room: Room | null;
        let sender: User | null;
        for (const invite of invites) {
            try {
                room = await Room.find(invite.room_id);
            } catch (e) {
                console.log(e);
                return response.json({ error: "Error while getting room" });
            }
            try {
                sender = await User.find(invite.sender_id);
            } catch (e) {
                console.log(e);
                return response.json({ error: "Error while getting sender" });
            }
            invites_data.push({
                room: room?.name || "",
                sender: sender?.name || "",
                invite_code: invite.invite_code
            });
        }

        return response.json(invites_data);
    }
}