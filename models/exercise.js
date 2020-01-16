const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model(
  'Exercise',
  new Schema({
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
