import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { env } from '~/config/environment'
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
    /**
     * xử lý trưởng hợp trả về http only cookie cho phía client
     * đối với maxAge - thời gian sống của cookie ta sẽ để bằng với thời gian hết hạn của refreshToken, tùy dự án
     * lưu ý: thời gian sống của cookie khác với thời gian sống của token
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

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
