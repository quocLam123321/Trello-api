
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('controller')
    // console.log('req.body : ', req.body)
    // console.log('req.query : ', req.query)
    // console.log('req.params : ', req.params)
    // console.log('req.files : ', req.files)
    // console.log('req.cookies : ', req.cookies)
    // console.log('req.jwtDecode : ', req.jwtDecode)

    const createdBoard = await boardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    // console.log('id : ', req.params.id)
    res.status(StatusCodes.OK).json(await boardService.getDetail(req.params.id))
  } catch (error) {
    next(error)
  }
}

const updateBoard = async (req, res, next) => {
  try {
    // console.log('id : ', req.params.id)
    res.status(StatusCodes.OK).json(await boardService.updateBoard(req.params.id, req.body))
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetail,
  updateBoard
}
