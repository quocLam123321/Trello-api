import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { env } from '~/config/environment'
import { ResendProvider } from '~/providers/ResendProvider'

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

export const userService = {
  createNew
}
