
import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'

const router = Router()

router.route('/')
  .get()
  .post()

export const boardRoutes = router
