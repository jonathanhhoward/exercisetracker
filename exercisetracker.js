const router = require('express').Router()

module.exports = (mongoose) => {
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
      duration: {
        type: Number,
        required: true,
        min: [1, 'duration too short']
      },
      date: Date
    })
  )

  const T120000 = 'T12:00:00'

  router.post('/new-user', (req, res, next) => {
    const { username } = req.body
    User.findOne({ username: username }, (err, user) => {
      if (err) return next(err)
      if (user) return next(new Error('username taken'))
      user = new User({ username: username })
      user.save(err => {
        if (err) return next(err)
        res.json({ username: user.username, _id: user._id })
      })
    })
  })

  router.get('/users', (req, res, next) => {
    User.find({})
      .select('_id username')
      .sort('username')
      .exec((err, users) => {
        if (err) return next(err)
        if (!users.length) return next(new Error('users not found'))
        res.json(users)
      })
  })

  router.post('/add', (req, res, next) => {
    const { userId, date } = req.body
    if (!userId) return next(new Error('userId required'))
    User.findById({ _id: userId }, (err, user) => {
      if (err) return next(err)
      if (!user) return next(new Error('user not found'))
      Exercise.create({
        ...req.body,
        date: date
          ? new Date(date + T120000)
          : new Date()
      }, (err, exercise) => {
        if (err) return next(err)
        res.json({
          username: user.username,
          userId: exercise.userId,
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString()
        })
      })
    })
  })

  router.get('/log', (req, res, next) => {
    const { userId, from, to, limit } = req.query
    if (!userId) return next(new Error('userId required'))
    User.findById({ _id: userId }, (err, user) => {
      if (err) return next(err)
      if (!user) return next(new Error('user not found'))
      const query = Exercise.find({ userId: user._id })
      if (from || to) {
        query.where('date')
        if (from) query.gte(from + T120000)
        if (to) query.lte(to + T120000)
      }
      if (limit) query.limit(Number(limit))
      query.exec((err, exercises) => {
        if (err) return next(err)
        res.json({
          _id: user._id,
          username: user.username,
          from: from,
          to: to,
          count: exercises.length,
          log: exercises.map(exercise => ({
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString()
          }))
        })
      })
    })
  })

  router.get('/clear-users', (req, res, next) => {
    User.deleteMany({}, err => {
      if (err) next(err)
      res.send('users cleared')
    })
  })

  router.get('/clear-exercises', (req, res, next) => {
    Exercise.deleteMany({}, err => {
      if (err) return next(err)
      res.send('exercises cleared')
    })
  })

  return router
}
