import Route from '@ioc:Adonis/Core/Route'

Route.post('/transaction/create', 'TransactionController.create').middleware('auth')