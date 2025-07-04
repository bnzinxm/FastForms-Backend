import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes';

dotenv.config()

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:5173/"]
}));
app.use(express.json())

app.get('/', (req, res) => {
  res.send('FastForms API rodando com sucesso 🚀')
})

// routes
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`✅ FastForms API está no ar: http://localhost:${PORT}`)
})
