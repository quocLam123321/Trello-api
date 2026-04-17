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

// update status của board invitation
router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized, invitationController.updateBoardInvitation)

export const invitationRoute = router
