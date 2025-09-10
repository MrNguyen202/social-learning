const express = require('express');
const router = express.Router();
const writingController = require('../../controllers/learning/writingController');

// Get list writing-paragraphs by type_exercise, level and type_paragraph
router.get('/writing-paragraphs/:type_exercise_slug/:level_slug/:type_paragraph_slug', writingController.getListWritingParagraphsByTypeLevelTypeParagraphs);

// Get writing-paragraph by id
router.get('/writing-paragraphs/:id', writingController.getWritingParagraphById);

// Submit writing-paragraph exercise
router.post('/writing-paragraphs/submit', writingController.submitWritingParagraphExercise);

// Get progress writing-paragraph by user_id and paragraph_id
router.get('/writing-paragraphs/:user_id/progress/:paragraph_id', writingController.getProgressWritingParagraph);

module.exports = router;