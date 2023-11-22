import Route from '@ioc:Adonis/Core/Route'

Route.get('/room/transactions', 'RoomController.getAllTransactions')
Route.post('/room/create', 'RoomController.create')
Route.post('/room/join', 'RoomController.join')
Route.get('/room/users', 'RoomController.getUsers')
Route.get('/room/invite_code', 'RoomController.getInviteCode')
Route.get('/room/join/:invite', 'RoomController.join')