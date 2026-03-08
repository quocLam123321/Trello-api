
import { Router } from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = Router()

router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

export const cardRoute = router
