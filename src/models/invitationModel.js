const Joi = require('joi')
const { ObjectId } = require('mongodb')
const { INVITATION_TYPE, BOARD_INVITATION_STATUS } = require('~/utils/constants')
const { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } = require('~/utils/validators')
import { mongodb } from '~/config/mongodb'
import { userModel } from './userModel'
import { boardModel } from './boardModel'


// define model
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPE)),
  // lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định những fields ta không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

// validate data trước khi lưu vào collection
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // biến đổi dữ liệu
    const newInvitationData = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }
    // nếu tồn tại boardInvitation thì biến đổi dữ liệu cho boardId thành ObjectId
    if (validData.boardInvitation) {
      newInvitationData.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    // lưu vào db
    const result = await mongodb.GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await mongodb.GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    // lọc field không được update
    Object.keys(data).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete data[field]
      }
    })

    const result = await mongodb.GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' } // trả về result mới sau khi update
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// query tổng hợp (aggregate) để lấy những bản ghi invitation của thằng user cụ thể
const findByUser = async (userId) => {
  try {
    const queryCondition = [
      { inviteeId: new ObjectId(userId) }, // dùng inviteeId để lấy invitation của user hiện tại
      { _destroy: false }
    ]

    const results = await mongodb.GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryCondition } },
      // lookup để join với bảng users lấy thông tin inviter
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviterId',
        foreignField: '_id',
        as: 'inviter',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviteeId',
        foreignField: '_id',
        as: 'invitee',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: boardModel.BOARD_COLLECTION_NAME,
        localField: 'boardInvitation.boardId',
        foreignField: '_id',
        as: 'board',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}
