import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes';

dotenv.config()

const app = express();

const allowedOrigins = ['https://fastforms-app.vercel.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // caso queira suportar cookies no futuro
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
