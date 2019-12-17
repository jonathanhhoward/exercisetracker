require('dotenv').config()

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('new connection error:', err))

mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', () => console.log('Mongoose connected'))

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'))

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    username: {
      type: String,
      required: true
    }
  })
)

const Exercise = mongoose.model(
  'Exercise',
  new mongoose.Schema({
    userId: { type: String, required: true, minlength: 1 },
    description: { type: String, required: true },
    duration: { type: Number, required: true, min: [1, 'duration too short'] },
    date: Date
  })
)

app.post('/api/exercise/new-user', (req, res, next) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return next(err)
    if (user) return next(new Error('username taken'))
    user = new User({ username: req.body.username })
    user.save(err => {
      if (err) return next(err)
      res.json({ username: user.username, _id: user._id })
    })
  })
})

app.get('/api/exercise/users', (req, res, next) => {
  User.find({})
    .select('_id username')
    .sort('username')
    .exec((err, users) => {
      if (err) return next(err)
      if (!users.length) return next(new Error('users not found'))
      res.json(users)
    })
})

app.post('/api/exercise/add', (req, res, next) => {
  if (!req.body.userId) return next(new Error('userId required'))
  User.findById({ _id: req.body.userId }, (err, user) => {
    if (err) return next(err)
    if (!user) return next(new Error('user not found'))
    Exercise.create({
      ...req.body,
      date: req.body.date
        ? new Date(req.body.date + 'T12:00:00')
        : new Date()
    }, (err, exercise) => {
      if (err) return next(err)
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      })
    })
  })
})

// app.get('/api/exercise/log', () => {
//   // unknown _id
//   // {"_id":"rkR9FOppS","username":"asdfdsfdfffd","count":0,"log":[]}
//   // {"_id":"H1DAaL3Tr","username":"Probiotic","count":2,"log":[{"description":"walk","duration":10,"date":"Wed Dec 11 2019"},{"description":"run","duration":5,"date":"Wed Dec 11 2019"}]}
//   // {"_id":"H1DAaL3Tr","username":"Probiotic","from":"Tue Nov 05 2019","count":3,"log":[{"description":"walk","duration":1.3,"date":"Wed Dec 11 2019"},{"description":"walk","duration":10,"date":"Wed Dec 11 2019"},{"description":"run","duration":5,"date":"Wed Dec 11 2019"}]}
//   // {"_id":"H1DAaL3Tr","username":"Probiotic","from":"Tue Jan 01 2019","count":1,"log":[{"description":"walk","duration":1.3,"date":"Wed Dec 11 2019"}]}
// })

app.get('/clearusers', (req, res, next) => {
  User.deleteMany({}, err => {
    if (err) next(err)
    res.send('users cleared')
  })
})

app.get('/clearexercises', (req, res, next) => {
  Exercise.deleteMany({}, err => {
    if (err) return next(err)
    res.send('exercises cleared')
  })
})

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
  res.status(errCode).type('txt')
    .send(errMessage)
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    'Server listening at http://%s:%s',
    server.address().host || 'localhost',
    server.address().port
  )
})
