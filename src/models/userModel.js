import Joi from 'joi'
import { USER_ROLES } from '~/utils/constants'
import { mongodb } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  // userName cắt ra từ email có thể trùng nhau bởi vì sẽ có những tên email giống nhau nhưng nhà cung cấp khác nhau
  userName: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định những field không được cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'userName', 'createdAt']

//validate data trước khi lưu vào collection
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const result = await mongodb.GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await mongodb.GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    const result = await mongodb.GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: email })
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

    const result = await mongodb.GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' } // trả về result mới sau khi update
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update
}
