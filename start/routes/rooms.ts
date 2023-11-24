import Route from '@ioc:Adonis/Core/Route'

Route.get('/room/transactions', 'RoomController.getAllTransactions')
Route.post('/room/create', 'RoomController.create')
Route.post('/room/join', 'RoomController.join')
Route.get('/room/users', 'RoomController.getUsers')
Route.get('/room/invite_code', 'RoomController.getInviteCode')
Route.get('/room/join/:invite', 'RoomController.join')
Route.post('/room/update', 'RoomController.update')
Route.post('/room/kick', 'RoomController.kick')
Route.post('/room/destroy', 'RoomController.destroy')
Route.get('/room/invite/:invite_code', 'RoomController.joinWithLink')