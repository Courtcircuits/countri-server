import Route from '@ioc:Adonis/Core/Route'

Route.get('/users', 'UserController.index')
Route.get('/users/me', 'UserController.get')
Route.post('/login', 'UserController.login')
Route.post('/register', 'UserController.register')
Route.get('/rooms', 'UserController.listRooms')
Route.post('/logout', 'UserController.logout')