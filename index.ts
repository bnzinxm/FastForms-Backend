import * as express from 'express'
import * as cors from 'cors'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('FastForms API rodando com sucesso 🚀')
})

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`✅ FastForms API está no ar: http://localhost:${PORT}`)
})
