
import { Router } from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'

const router = Router()

router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

router.route('/:id')
  .put(columnValidation.updateColumn, columnController.updateColumn)
  .delete(columnValidation.deleteColumn, columnController.deleteColumn)

export const columnRoute = router
