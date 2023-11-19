import Route from '@ioc:Adonis/Core/Route'

Route.post('/room/create', 'RoomController.create')
Route.post('/room/join', 'RoomController.join')