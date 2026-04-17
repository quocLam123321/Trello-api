import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
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
    const board = await boardModel.findOneById(reqBody.boardId)
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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('🚀 ~ getInvitations ~ getInvitations:', getInvitations)

    // vì các dữ liệu inviter, invitee, board chỉ có một phần tử nên ta lấy sẵn ra luôn rồi trả về cho fe
    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))
    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // tìm bản ghi invitation trong model
    const invitation = await invitationModel.findOneById(invitationId)
    if (!invitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')

    // lấy full thông tin board
    const getBoard = await boardModel.findOneById(invitation.boardInvitation.boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    // kiểm tra xem nếu user nhấn ACCEPT mà user (invitee) đã là member hoặc owner của board rồi thì return lỗi về luôn
    // chuyển về dạng string vì query từ db sẽ là ObjectId
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board')
    }

    // tạo dữ liệu để update
    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status
      }
    }

    // b1: update status trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // b2: nếu ACCEPT thành công thì thêm thông tin của user vào bản ghi memberIds của board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(invitation.boardInvitation.boardId, userId)
    }
    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
