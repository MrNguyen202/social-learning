const express = require('express');
const router = express.Router();
const learningController = require('../../controllers/learning/learningController');

// Get type exercises by slug
router.get('/type-exercises/:slug', learningController.getTypeExercisesBySlug);

// Get all levels by type_exercise
router.get('/levels/:type_exercise_id', learningController.getAllLevelsByTypeExercise);

// Get all topics by type_exercise
router.get('/topics/:type_exercise_id', learningController.getAllTopicsByTypeExercise);

// Get all levels
router.get('/levels', learningController.getAllLevels);

// Get all type paragraphs
router.get('/type-paragraphs', learningController.getAllTypeParagraphs);

// Get all topics
router.get('/topics', learningController.getAllTopics);

// Get level by slug
router.get('/level/slug/:slug', learningController.getLevelBySlug);

// Get topic by slug
router.get('/topic/slug/:slug', learningController.getTopicBySlug);

// Get type paragraph by slug
router.get('/type-paragraph/slug/:slug', learningController.getTypeParagraphBySlug);

module.exports = router;
