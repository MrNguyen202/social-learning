const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');

// Get type exercises by slug
router.get('/type-exercises/:slug', learningController.getTypeExercisesBySlug);

// Get all levels by type_exercise
router.get('/levels/:type_exercise_id', learningController.getAllLevelsByTypeExercise);

// Get all topics by type_exercise
router.get('/topics/:type_exercise_id', learningController.getAllTopicsByTypeExercise);

// Get list writing-paragraphs by type_exercise, level and type_paragraph
router.get('/writing-paragraphs/:type_exercise_slug/:level_slug/:type_paragraph_slug', learningController.getListWritingParagraphsByTypeLevelTypeParagraphs);

// Get writing-paragraph by id
router.get('/writing-paragraphs/:id', learningController.getWritingParagraphById);

// Get all levels
router.get('/levels', learningController.getAllLevels);

// Get all type paragraphs
router.get('/type-paragraphs', learningController.getAllTypeParagraphs);

// Get all topics
router.get('/topics', learningController.getAllTopics);

module.exports = router;
