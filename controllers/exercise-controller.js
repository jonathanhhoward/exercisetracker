const User = require('../models/user')
const Exercise = require('../models/exercise')

exports.createUser = (req, res, next) => {
  const { username } = req.body
  User.findOne({ username: username }, (err, user) => {
    if (err) return next(err)
    if (user) return next(new Error('username taken'))
    User.create(
      { username: username },
      (err, newUser) => {
        if (err) return next(err)
        res.json({ username: newUser.username, _id: newUser._id })
      }
    )
  })
}

exports.listUsers = (req, res, next) => {
  User.find()
    .select('_id username')
    .sort('username')
    .exec((err, users) => {
      if (err) return next(err)
      if (users.length === 0) {
        const error = new Error('users not found')
        error.status = 404
        return next(error)
      }
      res.json(users)
    })
}

exports.addExercise = (req, res, next) => {
  const { userId, date } = req.body
  if (!userId) return next(new Error('userId required'))
  User.findById({ _id: userId }, (err, user) => {
    if (err) return next(err)
    if (!user) return next(new Error('user not found'))
    Exercise.create({
      ...req.body,
      date: date
        ? new Date(date)
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
}

exports.showUserLog = (req, res, next) => {
  const { userId, from, to, limit } = req.query
  if (!userId) return next(new Error('userId required'))
  User.findById({ _id: userId }, (err, user) => {
    if (err) return next(err)
    if (!user) return next(new Error('user not found'))
    const query = Exercise.find({ userId: user._id })
    if (from || to) {
      query.where('date')
      if (from) query.gte(from)
      if (to) query.lte(to)
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
}

exports.clearUsers = (req, res, next) => {
  User.deleteMany({}, err => {
    if (err) next(err)
    res.send('users cleared')
  })
}

exports.clearExercises = (req, res, next) => {
  Exercise.deleteMany({}, err => {
    if (err) return next(err)
    res.send('exercises cleared')
  })
}
