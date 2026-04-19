/* eslint-disable no-useless-catch */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

const update = async (id, body, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...body,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      // cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.updateCard(id, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // tạo dữ liệu comment mới để thêm vào db
      const commentData = {
        ...updateData.commentToAdd,
        userId: userInfo._id,
        userEmail: userInfo.email,
        commentedAt: Date.now()
      }
      const updatedCard = await cardModel.unshiftNewComment(id, commentData)
      return updatedCard
    } else if (updateData.incomingMemberInfo) {
      // ADD hoặc REMOVE member khỏi card
      updatedCard = await cardModel.updateMembers(id, updateData.incomingMemberInfo)
    } else {
      // update chung title, des,...
      updatedCard = await cardModel.updateCard(id, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
