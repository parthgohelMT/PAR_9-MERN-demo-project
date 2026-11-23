require('dotenv').config()

let app
let pool

try {
  pool = require('./config/db')
  app = require('./app')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const port = Number(process.env.PORT || 5000)

async function start() {
  try {
    await pool.query('SELECT 1')
    app.listen(port, () => {
      console.log(`Product API listening on port ${port}`)
    })
  } catch (error) {
    console.error('Unable to connect to the configured MySQL database.', error.message)
    process.exit(1)
  }
}

void start()
