import AuthUser from "App/Models/AuthUser"
import Room from "App/Models/Room"

export async function isInRoom(auth_user: AuthUser, room: Room){
  const check = await room.related('users').query().where('user_id', auth_user.user_id);
  return check.length > 0;
}
