// export const

import AuthUser from "App/Models/AuthUser"
import Room from "App/Models/Room"
import User from "App/Models/User"

//
export async function isAdmin(auth_user: AuthUser, room: Room) {
  const user = await User.findOrFail(auth_user.user_id)
  console.log('isAdmin', user.id, room.admin_id)
  return room.admin_id === user.id
}
