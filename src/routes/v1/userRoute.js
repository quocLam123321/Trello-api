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
export const userRoute = router
