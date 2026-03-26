import { mongodb } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'

const Joi = require('joi')

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // những admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // những thành viên board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định những fields ta không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async (data) => {
  try {
    // validate dữ liệu một lần nữa trước khi lưu vào sb
    const validatedData = await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const createdBoard = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validatedData)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const board = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return board
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (id) => {
  try {
    const board = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: {
          _id: new ObjectId(id),
          _destroy : false
        } },
        { $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        } },
        { $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        } }
      ]).toArray()
    // console.log('board : ', board)
    return board[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// hàm này có nhiệm vụ thêm một columnId vào cuối mảng columnOrderIds trong board
// push là thêm 1 phần tử vào mảng
const pushColumnOrderIds = async (column) => {
  try {
    const result = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: {
        columnOrderIds: new ObjectId(column._id)
      } },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateBoard = async (id, updateData) => {
  try {
    // lọc field
    Object.keys(updateData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updateData[field]
      }
    })

    // xử lý ObjectId
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(columnId => new ObjectId(columnId))
    }

    const result = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set : updateData },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

// pull là lấy 1 phần tử trong mảng columnOrderIds và xóa đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: {
        columnOrderIds: new ObjectId(column._id)
      } },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryCondition = [
      // b1: board chưa bị xóa
      { _destroy: false },
      // b2: user thực hiện req phải nằm trong ownerId hoặc memberIds của board
      { $or: [
        { ownerIds: new ObjectId(userId) },
        { memberIds: new ObjectId(userId) }
      ] }
    ]

    const query = await mongodb.GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryCondition } },
        { $sort: { title: 1 } },
        { $facet: {
          // luồng 1: query boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          // luồng 2: query total boards
          'queryTotalBoards': [
            { $count: 'countedAllBoards' }
          ]
        } }
      ],
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]
    // console.log('🚀 ~ getBoards ~ res:', res)
    // console.log('🚀 ~ getBoards ~ res.queryBoards:', res.queryBoards)
    // console.log('🚀 ~ getBoards ~ res.queryTotalBoards[0]?.countedAllBoards:', res.queryTotalBoards[0]?.countedAllBoards)
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetail,
  pushColumnOrderIds,
  updateBoard,
  pullColumnOrderIds,
  getBoards
}
