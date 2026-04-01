import { StatusCodes } from 'http-status-codes'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPE } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // kiểm tra xem các dữ liệu cần có tồn tại trong sb ko
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    const board = await userModel.findOneById(reqBody.boardId)
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board not found')
    }

    // tạo data để lưu vào db
    const newInvitationData = {
      inviterId,
      // chuyển id về dạng string
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPE.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // gọi sang model
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)
    // ngoài thông tin của board invitation thì ta trả về luôn board, inviter và invitee để client dễ xử lý
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation
}
