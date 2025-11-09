import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rootRouter from './routes/index.js'
import { PrismaClient } from './generated/prisma/client.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

export const prisma = new PrismaClient({ log: ['query'] })

app.use(cors())
app.use(express.json())

app.use('/api', rootRouter)

app.listen(PORT, () => {
  console.log(`Tout est prêt sur le port ${PORT}`)
})