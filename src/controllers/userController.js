import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await userService.createNew(req.body))
  } catch (error) {
    next(error)
  }
}

const verify = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await userService.verify(req.body))
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    // xử lý cookie
    console.log('🚀 ~ login ~ result:', result)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verify,
  login
}
