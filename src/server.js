/* eslint-disable no-console */
import express from 'express'
import { env } from './config/environment'
import { mongodb } from './config/mongodb'

const START_APP = () => {
  const app = express()

  const hostname = env.APP_HOST
  const port = env.APP_PORT

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Server is running at http://${hostname}:${port}`)
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
