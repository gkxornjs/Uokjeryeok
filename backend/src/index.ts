import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

// ✅ Railway가 알려주는 포트를 사용 (없으면 4000)
const PORT = Number(process.env.PORT || 4000)
// ✅ 반드시 0.0.0.0 로 바인딩 (localhost X)
const HOST = '0.0.0.0'

app.use(cors({
  origin: (process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000']),
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// ✅ Railway 기본 헬스체크가 / 일 수 있으니 둘 다 200을 주는게 안전
app.get('/', (_, res) => res.status(200).send('ok'))
app.get('/health', (_, res) => res.status(200).json({ ok: true }))

// ... (기존 라우트 mount: /auth, /records, /stats 등)

app.listen(PORT, HOST, () => {
  console.log(`[backend] listening on http://${HOST}:${PORT}`)
})
