
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    // console.log('validation')

    await correctSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: new Error(error).message })
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}

const updateColumn = async (req, res, next) => {
  const correctSchema = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    // console.log('validation')

    await correctSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: new Error(error).message })
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}

export const columnValidation = {
  createNew,
  updateColumn
}
