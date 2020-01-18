const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model(
  'Exercise',
  new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, required: true },
    duration: {
      type: Number,
      required: true,
      min: [1, 'duration too short']
    },
    date: Date
  })
)
