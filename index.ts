import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express();

app.use(cors({
  origin: "https://fastforms-app.vercel.app"
}));
app.use(express.json())

app.get('/', (req, res) => {
  res.send('FastForms API rodando com sucesso 🚀')
})

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`✅ FastForms API está no ar: http://localhost:${PORT}`)
})
