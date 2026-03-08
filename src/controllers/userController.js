import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { env } from '~/config/environment'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

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

const logout = async (req, res, next) => {
  try {
    // xóa cookie
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ message: 'Logout successfully!' })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken
    if (!refreshTokenFromCookie) throw new ApiError(StatusCodes.FORBIDDEN, 'No refresh token provided!')
    const result = await userService.refreshToken(refreshTokenFromCookie) // lấy refresh token từ cookie
    if (!result) throw new ApiError(StatusCodes.FORBIDDEN, 'No access token provided!')
    // lấy access token mới và xử lý cookie
    res.cookie('accessToken', result.accessToken, {
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
  login,
  logout,
  refreshToken
}
