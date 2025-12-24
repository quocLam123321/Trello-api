import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Hello from API v1' })
  })

// board routes
router.use('/boards', boardRoute)

// column routes
router.use('/columns', columnRoute)

// card routes
router.use('/cards', cardRoute)

export const API_V1 = router
