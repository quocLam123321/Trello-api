/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { env } from './config/environment'
import { mongodb } from './config/mongodb'
import { API_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'

const START_APP = () => {
  const app = express()

  app.use(cors(corsOptions))

  app.use(express.json())

  // sử dụng api v1
  app.use('/v1', API_V1)

  // middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  const hostname = env.APP_HOST
  const port = env.APP_PORT

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Server is running at http://${hostname}:${port}`)
    if (env.BUILD_MODE === 'dev') console.log('4. Server is running in DEV mode')
    else console.log('4. Server is running in PRODUCTION mode')
  })
}

(async () => {
  try {
    // connect to db
    console.log('1. Connecting to db ...')
    await mongodb.CONNECT()
    console.log('2. Connected to db')
    START_APP()
  } catch (err) {
    console.log(err)
    process.exit(0)
  }
})()
