
import { Router } from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'

const router = Router()

router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

export const columnRoute = router
