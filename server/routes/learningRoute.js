const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');

// Get type exercises by slug
router.get('/type-exercises/:slug', learningController.getTypeExercisesBySlug);

// Get all levels by type_exercise
router.get('/levels/:type_exercise_id', learningController.getAllLevelsByTypeExercise);

// Get all topics by type_exercise
router.get('/topics/:type_exercise_id', learningController.getAllTopicsByTypeExercise);

module.exports = router;
