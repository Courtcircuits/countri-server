import AuthUser from "App/Models/AuthUser"
import User from "App/Models/User"

interface UserToCreate {
  email: string
  password: string
  username: string
}

class AuthenticationService {
  public async createUser(data: UserToCreate): Promise<{ user: User | null, auth_user: AuthUser | null }> {
    const { username, email, password } = data
    const user = await User.create({
      name: username
    })

    try {
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
    } catch (e) {
      if (e.code === '23505') {
        throw new Error('Email already exists')
      }
    }
    return {
      user: null,
      auth_user: null
    }
  }
}

export default new AuthenticationService()
