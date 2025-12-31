
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES)).required()
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

const updateBoard = async (req, res, next) => {
  // lưu ý khi update ta sẽ không require
  const correctSchema = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES))
  })

  try {
    // console.log('validation')

    await correctSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true // có thể update các field không cần phải validate
    })
    next()
  } catch (error) {
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: new Error(error).message })
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctSchema = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    oldColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    oldCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),

    newColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    newCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    // console.log('validation')

    await correctSchema.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: new Error(error).message })
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  updateBoard,
  moveCardToDifferentColumn
}
