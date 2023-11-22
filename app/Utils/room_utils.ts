import Room from "App/Models/Room";

export async function checkIfInRoom(user_id: number, room_id: Room);
export async function checkIfInRoom(user_id: number, room_id: number);
export async function checkIfInRoom(user_id: any, room_id: any): Promise<boolean> {
    let room: Room;
    if (typeof room_id === "number") {
        try{
            room = await Room.findOrFail(room_id);
        }catch(e){
            return false;
        }
    }else {
        room = room_id;
    }
    const check = await room.related('users').query().where('user_id', user_id);
    if (check.length === 0) {
        return false;
    }
    return true;
}

