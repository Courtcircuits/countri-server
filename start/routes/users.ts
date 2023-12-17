import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/users/me', 'UserController.get')
    Route.get('/rooms', 'UserController.listRooms')
}).middleware('auth')
Route.post('/login', 'AuthenticationController.login')
Route.post('/register', 'AuthenticationController.register')
Route.post('/logout', 'AuthenticationController.logout')