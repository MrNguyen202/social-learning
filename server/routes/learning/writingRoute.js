const express = require('express');
const router = express.Router();
const writingController = require('../../controllers/learning/writingController');

// Get list writing-paragraphs by type_exercise, level and type_paragraph
router.get('/writing-paragraphs/:type_exercise_slug/:level_slug/:type_paragraph_slug', writingController.getListWritingParagraphsByTypeLevelTypeParagraphs);

// Get writing-paragraph by id
router.get('/writing-paragraphs/:id', writingController.getWritingParagraphById);

module.exports = router;