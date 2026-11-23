const express = require('express')
const cors = require('cors')
const productRoutes = require('./routes/productRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }))
app.use('/api/products', productRoutes)
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use(errorHandler)

module.exports = app
