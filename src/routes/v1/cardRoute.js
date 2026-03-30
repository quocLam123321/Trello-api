
import { Router } from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const router = Router()

router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

router.route('/:id')
  .put(authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )

export const cardRoute = router
