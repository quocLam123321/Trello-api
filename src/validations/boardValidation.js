
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict()
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

export const boardValidation = {
  createNew
}
