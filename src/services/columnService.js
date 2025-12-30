/* eslint-disable no-useless-catch */

import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

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

export const columnService = {
  createNew,
  updateColumn
}
