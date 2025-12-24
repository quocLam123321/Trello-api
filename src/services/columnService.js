/* eslint-disable no-useless-catch */

import { columnModel } from '~/models/columnModel'

const createNew = async (body) => {
  try {
    const newColumn = {
      ...body
    }

    const createdColumn = await columnModel.createNew(newColumn)
    // console.log('createdColumn : ', createdColumn)

    const column = await columnModel.findOneById(createdColumn.insertedId)
    return column
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
