
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

    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)

    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    // console.log('id : ', req.params.id)
    const userId = req.jwtDecoded._id
    const BoardId = req.params.id
    res.status(StatusCodes.OK).json(await boardService.getDetail(userId, BoardId))
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

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await boardService.moveCardToDifferentColumn(req.body))
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilter = q
    res.status(StatusCodes.OK).json(await boardService.getBoards(userId, page, itemsPerPage, queryFilter))
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetail,
  updateBoard,
  moveCardToDifferentColumn,
  getBoards
}
