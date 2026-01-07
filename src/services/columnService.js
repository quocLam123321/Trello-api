/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

const createNew = async (body) => {
  try {
    const newColumn = {
      ...body
    }

    const createdColumn = await columnModel.createNew(newColumn)
    // console.log('createdColumn : ', createdColumn)

    const column = await columnModel.findOneById(createdColumn.insertedId)

    if (column) {
      // xử lý cấu trúc data, thêm mảng card rỗng cho column khi tạo mới
      column.cards = []

      // update columnOrderIds trong board
      await boardModel.pushColumnOrderIds(column)
    }

    return column
  } catch (error) {
    throw error
  }
}

const updateColumn = async (id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.updateColumn(id, updateData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (id) => {
  try {

    // tìm column theo columnId
    const targetColumn = await columnModel.findOneById(id)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    // xóa column
    await columnModel.deleteOneById(id)
    // xóa card thuộc column trên
    await cardModel.deleteAllCardsByColumnId(id)
    // update columnOrderIds trong board
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its card deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  updateColumn,
  deleteColumn
}
