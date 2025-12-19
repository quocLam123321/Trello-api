/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'

const createNew = async (body) => {
  try {
    const newBoard = {
      ...body,
      slug: slugify(body.title)
    }

    const createdBoard = await boardModel.createNew(newBoard)
    // console.log('createdBoard : ', createdBoard)

    const board = await boardModel.findOneById(createdBoard.insertedId)
    return board
  } catch (error) {
    throw error
  }
}

// tạm thời hàm này chỉ như thế thôi mình sẽ học aggregate sau để lấy các column và card thuộc về cái board đó
const getDetail = async (id) => {
  try {
    const boardDetail = await boardModel.getDetail(id)
    if (!boardDetail) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    return boardDetail
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetail
}
