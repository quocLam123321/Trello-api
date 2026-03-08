
import { Router } from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = Router()

router.route('/')
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

router.route('/:id')
  .put(authMiddleware.isAuthorized, columnValidation.updateColumn, columnController.updateColumn)
  .delete(authMiddleware.isAuthorized, columnValidation.deleteColumn, columnController.deleteColumn)

export const columnRoute = router
