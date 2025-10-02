const express = require('express');
const router = express.Router();
const botCoverLearningController = require('../../controllers/learning/botCoverLearningController');

// Route to create a generated paragraph exercise
router.post('/generate-paragraph-exercise', botCoverLearningController.createGenerateParagraphExercise);

// Route to create a generated listening exercise
router.post('/generate-listening-exercise', botCoverLearningController.createGenerateListeningExercise);

// Route to feedback writing paragraph exercise
router.post('/feedback-writing-paragraph-exercise', botCoverLearningController.feedbackWritingParagraphExercise);

module.exports = router;