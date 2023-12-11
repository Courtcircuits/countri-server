import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/send', 'InviteController.create')
    Route.get('/join/:uuid', 'InviteController.join')
    Route.get('/deny/:uuid', 'InviteController.delete')
    Route.get('/get', 'InviteController.getAll')
}).prefix('/invite').namespace('App/Controllers/Http').middleware('auth')