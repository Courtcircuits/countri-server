import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/:id/transactions', 'RoomController.getAllTransactions')
    Route.get('/:id', 'RoomController.get')
    Route.post('/create', 'RoomController.create')
    Route.post('/join', 'RoomController.join')
    Route.get('/:id/users', 'RoomController.getUsers')
    Route.get('/:id/invite_code', 'RoomController.getInviteCode')
    Route.get('/join/:invite', 'RoomController.join')
    Route.post('/:id/update', 'RoomController.update')
    Route.post('/:id/leave', 'RoomController.leave')
    Route.post('/:id/destroy', 'RoomController.destroy')
    Route.get('/invite/:invite_code', 'RoomController.joinWithLink')
}).prefix('/room').namespace('App/Controllers/Http').middleware('auth')

Route.group(() => {
    Route.get('/all', 'RoomController.getAllDetails')
}).namespace('App/Controllers/Http').middleware('auth')
