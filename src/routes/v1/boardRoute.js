
import { Router } from 'express'
import { boardController } from '~/controllers/boardController'
import { boardValidation } from '~/validations/boardValidation'

const router = Router()

router.route('/')
  .get()
  .post(boardValidation.createNew, boardController.createNew)

export const boardRoute = router
