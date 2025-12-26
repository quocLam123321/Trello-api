/* eslint-disable no-useless-catch */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (body) => {
  try {
    const newCard = {
      ...body
    }

    const createdCard = await cardModel.createNew(newCard)
    // console.log('createdCard : ', createdCard)

    const card = await cardModel.findOneById(createdCard.insertedId)

    if (card) {
      //update cardOrderIds trong column
      await columnModel.pushCardOrderIds(card)
    }

    return card
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}
