import AuthUser from "App/Models/AuthUser"
import User from "App/Models/User"

interface UserToSend {
    id: number
    name: string
    email: string
    profile_picture: string
    rooms: {
        id: string
        name: string
    }[]
}


class UserService {
    public async get(user_id: number, user_email: string): Promise<UserToSend> {
        const user = await User.findOrFail(user_id);
        const rooms = await user.related('rooms').query();
        return {
            id: user.id,
            name: user.name,
            profile_picture: user.profile_picture,
            email: user_email,
            rooms: rooms.map((room) => {
                return {
                    id: room.id.toString(),
                    name: room.name
                }
            })
        }
    }

    public async listRooms(user_id: number): Promise<{ id: string, name: string }[]> {
        const user = await User.findOrFail(user_id);
        const rooms = await user.related('rooms').query();
        return rooms.map((room) => {
            return {
                id: room.id.toString(),
                name: room.name
            }
        })
    }

    public async listUsers(pattern: string, user_id: number): Promise<string[]> {
      const users = await AuthUser.query().whereNotIn('id', [user_id]).whereILike('email', '%'+pattern+'%').select('email').limit(10)
      return users.map((user) => {
        return user.email
      });
    }
}

export default new UserService()
