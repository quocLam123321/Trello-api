
import { Router } from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'

const router = Router()

router.route('/')
  .post(cardValidation.createNew, cardController.createNew)

export const cardRoute = router
