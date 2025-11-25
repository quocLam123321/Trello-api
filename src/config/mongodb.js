import { MongoClient, ServerApiVersion } from 'mongodb'

let trelloDatabaseInstance = null

const mongodbClientInstance = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

const CONNECT = async () => {
  await mongodbClientInstance.connect()
  trelloDatabaseInstance = mongodbClientInstance.db(process.env.DATABASE_NAME)
}

const GET_DB = async () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to database first')
  return trelloDatabaseInstance
}

export const mongodb = {
  CONNECT,
  GET_DB
}
