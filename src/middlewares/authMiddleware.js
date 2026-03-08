import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ giúp kiểm tra xem token phía Client gửi lên có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // lấy toke từ cookie
  const accessTokenFromCookie = req.cookies?.accessToken

  // nếu ko có token thì return về 401 luôn
  if (!accessTokenFromCookie) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token not found!'))
    return
  }
  // tiến hành xác thực token
  try {
    // B1. Xác thực token
    const accessTokenDecoded = await JwtProvider.verifyToken(accessTokenFromCookie, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // B2. nếu xác thực thành công thì lưu vào jwtDecoded để dùng cho các tầng sau
    req.jwtDecoded = accessTokenDecoded
    // B3. Cho req đi tiếp
    next()
  } catch (error) {
    // nếu access token hết hạn thì tra về mã lỗi 410 - GONE về để fe tiến hành call api refresh token mới
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Your token is expired!'))
      return
    }
    // nếu bất kì lỗi nào khác ngoài 401 thì return về 401
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }
}

export const authMiddleware = {
  isAuthorized
}
