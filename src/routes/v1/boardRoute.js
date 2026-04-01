
import { Router } from 'express'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const router = Router()

router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetail)
  .put(authMiddleware.isAuthorized, boardValidation.updateBoard, boardController.updateBoard)

// api moving card
router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

export const boardRoute = router
