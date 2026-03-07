import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

/**
 * generateToken cần 3 tham số:
 * 1. payload: chứa thông tin cần được gửi đi (userInfor, role, ....)
 * 2. secret: chứa mã bí mật của token (secretKey, secretSignature, ....)
 * 3. options: chứa các tùy chọn khác như thời gian hết hạn của token (tokenLife, algorithm, ...)
 */
const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return jwt.sign(payload, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * kiểm tra xem token có hợp lệ hay không
 * đơn giản là token được tạo ra có đúng với cái chữ ký bí mật không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return jwt.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
