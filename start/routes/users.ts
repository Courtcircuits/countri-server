import Route from '@ioc:Adonis/Core/Route'

Route.get('/users', 'UserController.index')
Route.post('/login', 'UserController.login')
Route.post('/register', 'UserController.register')
