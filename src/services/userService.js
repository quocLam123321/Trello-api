import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { env } from '~/config/environment'
import { ResendProvider } from '~/providers/ResendProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    // b1: kiểm tra email đã có trong database hay không
    if (await userModel.findOneByEmail(reqBody.email)) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }
    // b2: tạo data để lưu vào database
    // nếu email là user1@gmail.com thì sẽ tạo userName là user1
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp, giá trị càng lớn thì băm càng lâu
      userName: nameFromEmail,
      displayName: nameFromEmail, // để mặc định như userName có gì làm cái update sau
      verifyToken: uuidv4()
    }

    // b3: lưu vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // b4: gửi email cho user để xác thực
    const verificationLink = `${env.DOMAIN_WEB}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const to = getNewUser.email
    const subject = 'TRELLO: Please verify your email before using our service!'
    const html = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - Quoc Lam - Trello Team -</h3>
    `
    // gọi tới provider để gửi email
    await ResendProvider.sendEmail({ to, subject, html })
    // b5: return về client
    // xử lý data trước khi trả về (ko trả về password....)
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verify = async (reqBody) => {
  try {
    // query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token!')

    // nếu ko lỗi thì update lại thông tin user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')
    }

    /** Nếu mọi thứ oke thì ta tiến hành với jwt */
    // tạo payload cho token
    const payload = {
      _id: existUser._id,
      email: existUser.email
    }

    // tạo 2 loại token
    const accessToken = await JwtProvider.generateToken(
      payload,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      payload,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 10
      env.REFRESH_TOKEN_LIFE
    )

    // trả về userInfo và 2 loại token
    return { ...pickUser(existUser), accessToken, refreshToken }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  try {
    // 1. xác thực refresh token
    const refreshTokenDecoded = await JwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    // 2. nếu verify thành công thì tạo payload cho access token mới
    const payload = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }
    // 3. tạo access token mới
    const newAccessToken = await JwtProvider.generateToken(
      payload,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    return { accessToken: newAccessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, userAvtFile) => {
  try {
    // query user trong db
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // khởi tạo updatedUser ban đầu là rỗng
    let updatedUser = {}
    // case 1: change password
    if (reqBody.current_password && reqBody.new_password) {
      // check password
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }
      // update password
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvtFile) {
      // case 2: update avatar -> sử dụng cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvtFile.buffer, 'Trello-user-avatar')
      // console.log('🚀 ~ update ~ uploadResult:', uploadResult)
      // lưu URL của ảnh vào db thông qua secure_url
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // update các thông tin chung: displayName, ...
      updatedUser = await userModel.update(existUser._id, reqBody)
    }
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verify,
  login,
  refreshToken,
  update
}
