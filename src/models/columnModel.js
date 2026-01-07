import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { mongodb } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định những fields ta không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const createNew = async (data) => {
  try {
    // validate dữ liệu một lần nữa trước khi lưu vào sb
    const validatedData = await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const newColumnToAdd = {
      ...validatedData,
      boardId: new ObjectId(validatedData.boardId)
    }
    const createdColumn = await mongodb.GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdColumn
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const column = await mongodb.GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return column
  } catch (error) {
    throw new Error(error)
  }
}

// hàm này có nhiệm vụ thêm một cardId vào cuối mảng CardOrderIds trong column
const pushCardOrderIds = async (card) => {
  try {
    const result = await mongodb.GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: {
        cardOrderIds: new ObjectId(card._id)
      } },
      { ReturnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateColumn = async (id, updateData) => {
  try {
    // lọc field
    Object.keys(updateData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updateData[field]
      }
    })

    // xử lý ObjectId
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map(cardId => new ObjectId(cardId))
    }

    const result = await mongodb.GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set : updateData },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (columnId) => {
  try {
    const result = await mongodb.GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({ _id: new ObjectId(columnId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  updateColumn,
  deleteOneById
}
