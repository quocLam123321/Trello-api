import { Router } from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'


const router = Router()

router.route('/register')
  .post(userValidation.createNew, userController.createNew)

router.route('/verify')
  .put(userValidation.verify, userController.verify)

router.route('/login')
  .post(userValidation.login, userController.login)

router.route('/logout')
  .delete(userController.logout)

router.route('/refresh_token')
  .put(userController.refreshToken)

export const userRoute = router
