/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { env } from './config/environment'
import { mongodb } from './config/mongodb'
import { API_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
// xử ly realtime với socket.io
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/InviteUserToBoardSocket'

const START_APP = () => {
  const app = express()
  // fix cái cache from disk của expressJs
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // cấu hình cookie parser
  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  // sử dụng api v1
  app.use('/v1', API_V1)

  // middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // xử lý realtime với socket.io
  // tạo một server mới bọc thằng app cảu express để làm realtime với socket.io
  const server = http.createServer(app)
  // khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // gọi các socket tùy tính năng ở đây
    inviteUserToBoardSocket(socket)
  })

  const hostname = env.APP_HOST
  const port = env.APP_PORT

  // dùng server.listen thay vì app.listen vì lúc này server đã bao gồm cả app của express và đã config socket.io
  server.listen(port, hostname, () => {
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
