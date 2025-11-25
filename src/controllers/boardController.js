
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res) => {
  try {
    console.log('controller')
    console.log('req.body : ', req.body)
    // console.log('req.query : ', req.query)
    // console.log('req.params : ', req.params)
    // console.log('req.files : ', req.files)
    // console.log('req.cookies : ', req.cookies)
    // console.log('req.jwtDecode : ', req.jwtDecode)

    res.status(StatusCodes.CREATED).json({ message: 'Board created successfully' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
  }
}

export const boardController = {
  createNew
}
