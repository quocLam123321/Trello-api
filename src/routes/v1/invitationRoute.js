import { Router } from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { invitationValidation } from '~/validations/invitationValidation'

const router = Router()

router.route('/board')
  .post(authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )

// get invitation by user
router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)

export const invitationRoute = router
