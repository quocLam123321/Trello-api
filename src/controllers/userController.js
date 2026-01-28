import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await userService.createNew(req.body))
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew
}
