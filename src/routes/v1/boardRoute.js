
import { Router } from 'express'
import { boardValidation } from '~/validations/boardValidation'

const router = Router()

router.route('/')
  .get()
  .post(boardValidation.createNew)

export const boardRoute = router
