import AuthUser from "App/Models/AuthUser"
import User from "App/Models/User"

interface UserToCreate {
    email: string
    password: string
    username: string
}

class AuthenticationService {
    public async createUser(data: UserToCreate): Promise<{user: User, auth_user: AuthUser}> {
        const {username, email, password} = data
        const user = await User.create({
            name: username
        })

        const local_user = await AuthUser.create({
            email: email,
            password: password,
            provider: 'local',
            user_id: user.id,
        })

        return {
            user: user,
            auth_user: local_user
        }
    }
}

export default new AuthenticationService()