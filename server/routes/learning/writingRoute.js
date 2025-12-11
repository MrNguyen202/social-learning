const express = require('express');
const router = express.Router();
const writingController = require('../../controllers/learning/writingController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Get list writing-paragraphs by type_exercise, level and type_paragraph
router.get('/writing-paragraphs/:type_exercise_slug/:level_slug/:type_paragraph_slug', authMiddleware,writingController.getListWritingParagraphsByTypeLevelTypeParagraphs);

// Get writing-paragraph by id
router.get('/writing-paragraphs/:id', writingController.getWritingParagraphById);

// Submit writing-paragraph exercise
router.post('/writing-paragraphs/submit', writingController.submitWritingParagraphExercise);

// Get progress writing-paragraph by user_id and paragraph_id
router.get('/get-progress/:user_id/:paragraph_id', writingController.getProgressWritingParagraph);

// Get history submit writingParagraph exercise by user_id and paragraph_id with feedback information
router.get('/history-submit/:user_id/:paragraph_id', writingController.getHistorySubmitWritingParagraphByUserAndParagraph);

module.exports = router;