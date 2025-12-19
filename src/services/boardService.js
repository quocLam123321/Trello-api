/* eslint-disable no-useless-catch */

import { boardModel } from '~/models/boardModel'
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

export const boardService = {
  createNew
}
