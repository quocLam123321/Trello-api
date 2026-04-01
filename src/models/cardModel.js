import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { mongodb } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ),
  // dữ liệu comment của card ta sẽ học cách nhúng - embedded vào bản ghi card luôn
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // chô này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống cái insertOne nhue crate được
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định những fields ta không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async (data) => {
  try {
    // validate dữ liệu một lần nữa trước khi lưu vào sb
    const validatedData = await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const newCardToAdd = {
      ...validatedData,
      boardId: new ObjectId(validatedData.boardId),
      columnId: new ObjectId(validatedData.columnId)
    }
    const createdCard = await mongodb.GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const card = await mongodb.GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return card
  } catch (error) {
    throw new Error(error)
  }
}

const updateCard = async (id, updateData) => {
  try {
    // lọc field
    Object.keys(updateData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updateData[field]
      }
    })
    const result = await mongodb.GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set : updateData },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteAllCardsByColumnId = async (columnId) => {
  try {
    const result = await mongodb.GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(columnId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await mongodb.GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      /**
       * Đẩy 1 comment mới vào array comment của card
       * - trong js ngược lại vs push (thêm phần tử vào cuối mảng) là unshift (thêm phần tử vào đầu mảng)
       * - nhưng trong mongoDB thì chỉ có push thôi nên muốn làm như unshift, thì phải bọc data vào array để trong each và chỉ đinh position là 0 để nó thêm vào đầu mảng
       * - tất nhiên push vào cuối mảng cũng được xong khi lấy data trả về cho fe bên service thì mình lộn ngược cái mảng lại là được
       */
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' } //có cái này để nó trả về document mới đã được update
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  updateCard,
  deleteAllCardsByColumnId,
  unshiftNewComment
}
