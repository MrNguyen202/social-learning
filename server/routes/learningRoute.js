const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');

// Get type exercises by slug
router.get('/type-exercises/:slug', learningController.getTypeExercisesBySlug);

// Get all levels by type_exercise
router.get('/levels/:type_exercise_id', learningController.getAllLevelsByTypeExercise);

// Get all topics by type_exercise
router.get('/topics/:type_exercise_id', learningController.getAllTopicsByTypeExercise);

// Get list writing-exercises by type_exercise, level and topic
router.get('/writing-exercises/:type_exercise_slug/:level_slug/:topic_slug', learningController.getListWritingExercisesByTypeLevelTopic);

// Get writing-exercise by id
router.get('/writing-exercises/:id', learningController.getWritingExerciseById);

module.exports = router;
