import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

import db from './config/database' // seu pool de conexão mysql2

dotenv.config()

const app = express()

const allowedOrigins = ['https://fastforms-app.vercel.app', 'http://localhost:5173']

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('FastForms API rodando com sucesso 🚀')
})

// routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Função para testar conexão com DB
async function checkDbConnection() {
  try {
    // pode usar uma query simples
    await db.query('SELECT 1')
    console.log('✅ Conexão com o banco de dados OK')
  } catch (error) {
    console.error('❌ Falha na conexão com o banco de dados:', error)
  }
}

const PORT = process.env.PORT || 3333

app.listen(PORT, async () => {
  console.log(`✅ FastForms API está no ar: http://localhost:${PORT}`)
  await checkDbConnection()
})
