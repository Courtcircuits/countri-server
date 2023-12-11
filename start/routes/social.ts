import Route from '@ioc:Adonis/Core/Route'

Route.get('/google/redirect', 'SocialController.redirect');

Route.get('/google/callback', 'SocialController.callback');