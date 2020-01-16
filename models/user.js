const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model(
  'User',
  new Schema({
    username: { type: String, required: true },
    exercises: [{ type: Schema.Types.ObjectID }]
  })
)
