/* eslint-disable no-useless-catch */

import { cardModel } from '~/models/cardModel'

const createNew = async (body) => {
  try {
    const newCard = {
      ...body
    }

    const createdCard = await cardModel.createNew(newCard)
    // console.log('createdCard : ', createdCard)

    const card = await cardModel.findOneById(createdCard.insertedId)
    return card
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}
