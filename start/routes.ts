/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
router.get('/', async () => {
  return { hello: 'world' }
})
router.post('/register', '#controllers/auth_controller.register')
router.post('/login', '#controllers/auth_controller.login')
router.get('/users', '#controllers/users_controller.usersWithoutAdminAndIsEnable')

router
  .group(() => {
    router.get('/logout', '#controllers/auth_controller.logout')
    router.get('/profile', '#controllers/users_controller.profile')
    router.patch('/profile', '#controllers/users_controller.updateProfile')
    router.patch('/profile/img', '#controllers/users_controller.updateProfileImg')
    router.patch('/profile/password', '#controllers/users_controller.updatePassword')
  })
  .use(middleware.auth({ guards: ['api'] }))


router
.group(() => {
    router.get('/users', '#controllers/admin_controller.usersInfo')
    router.get('/user/:id', '#controllers/admin_controller.userInfoById')
    router.patch('/user/:id', '#controllers/admin_controller.updateUserWithId')
    router.patch('/user/:id/img', '#controllers/admin_controller.updateImageWithId')
    router.patch('/user/:id/password', '#controllers/admin_controller.updatePasswordWithId')
    router.delete('/user/:id', '#controllers/admin_controller.deleteUserWithId')
    router.post('/user/:id/enabled', '#controllers/admin_controller.enableUserWithId')
}).prefix('/admin')
.use([middleware.auth({ guards: ['api'] }), middleware.isAdmin()])
