/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
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
    // console.log('boardDetail : ', boardDetail)

    const boardAfterEdit = cloneDeep(boardDetail)
    // đưa card về đúng column của nó
    boardAfterEdit.columns.forEach(column => {
      column.cards = boardAfterEdit.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    // xóa cards nằm song song với columns ở board đi
    delete boardAfterEdit.cards
    return boardAfterEdit
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetail
}
