/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { ObjectId } from 'mongodb'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const createNew = async (userId, body) => {
  try {
    const newBoard = {
      ...body,
      slug: slugify(body.title)
    }

    const createdBoard = await boardModel.createNew(userId, newBoard)
    // console.log('createdBoard : ', createdBoard)

    const board = await boardModel.findOneById(createdBoard.insertedId)
    return board
  } catch (error) {
    throw error
  }
}

// tạm thời hàm này chỉ như thế thôi mình sẽ học aggregate sau để lấy các column và card thuộc về cái board đó
const getDetail = async (userId, BoardId) => {
  try {
    const boardDetail = await boardModel.getDetail(userId, BoardId)
    if (!boardDetail) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    // console.log('boardDetail : ', boardDetail)

    const boardAfterEdit = cloneDeep(boardDetail)
    // đưa card về đúng column của nó
    boardAfterEdit.columns.forEach(column => {
      // column.cards = boardAfterEdit.cards.filter(card => card.columnId.toString() === column._id.toString())
      column.cards = boardAfterEdit.cards.filter(card => card.columnId.equals(column._id))
    })
    // xóa cards nằm song song với columns ở board đi
    delete boardAfterEdit.cards
    return boardAfterEdit
  } catch (error) {
    throw error
  }
}

const updateBoard = async (id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.updateBoard(id, updateData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}


const moveCardToDifferentColumn = async (reqBody) => {
  try {

    // B1: update cardOrderIds của column ban đầu => xóa cardId của cái card vừa kéo đi
    await columnModel.updateColumn(reqBody.oldColumnId, {
      cardOrderIds: reqBody.oldCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: update cardOrderIds của column đích => thêm cardId của cái card vừa kéo đến vào column đích
    await columnModel.updateColumn(reqBody.newColumnId, {
      cardOrderIds: reqBody.newCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: update lại columnId của cái card vừa kéo đó thành column đích
    await cardModel.updateCard(reqBody.currentCardId, {
      columnId: new ObjectId(reqBody.newColumnId)
    })

    return { message: 'Successfully' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilter) => {
  try {
    // dù bên FE không đây lên page hoặc itemsPerPage thì BE cũng phải gán giá trị default
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const result = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilter
    )
    return result
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetail,
  updateBoard,
  moveCardToDifferentColumn,
  getBoards
}
