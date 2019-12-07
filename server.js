require('dotenv').config()

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

app.use((req, res, next) => {
  return next({ status: 404, message: 'not found' })
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
  res.status(errCode).type('txt')
    .send(errMessage)
})

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('new connection error:', err))

mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', () => {
    console.log('Mongoose connected')
  })

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    'Server listening at http://%s:%s',
    server.address().host || 'localhost',
    server.address().port
  )
})
