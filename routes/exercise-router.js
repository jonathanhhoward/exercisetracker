const router = require('express').Router()
const mongoose = require('mongoose')
const exerciseController = require('../controllers/exercise-controller')

router.post('/new-user', exerciseController.createUser)

router.get('/users', exerciseController.listUsers)

router.post('/add', exerciseController.addExercise)

router.get('/log', exerciseController.showUserLog)

router.get('/clear-users', exerciseController.clearUsers)

router.get('/clear-exercises', exerciseController.clearExercises)

module.exports = router
