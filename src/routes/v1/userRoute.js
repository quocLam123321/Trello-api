import { Router } from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'


const router = Router()

router.route('/register')
  .post(userValidation.createNew, userController.createNew)

export const userRoute = router
