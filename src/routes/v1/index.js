import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoutes'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Hello from API v1' })
  })

// board routes
router.use('/boards', boardRoutes)

export const API_V1 = router
