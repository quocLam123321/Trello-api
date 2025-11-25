import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Hello from API v1' })
  })

// board routes
router.use('/boards', boardRoute)

export const API_V1 = router
