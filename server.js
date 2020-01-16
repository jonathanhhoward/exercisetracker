require('dotenv').config()

const bodyParser = require('body-parser')
const cors = require('cors')
const exerciseRouter = require('./routes/exercise-router')
const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(console.error)

mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', () => console.log('Database connected'))

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'))

app.use('/api/exercise', exerciseRouter)

app.use((req, res, next) => {
  next({ status: 404, message: 'not found' })
})

app.use((err, req, res, next) => {
  let errCode, errMessage
  if (err.errors) {
    errCode = 400
    const keys = Object.keys(err.errors)
    errMessage = err.errors[keys[0]].message
  } else {
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt').send(errMessage)
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    'Server listening at http://%s:%s',
    server.address().host || 'localhost',
    server.address().port
  )
})
