const express = require('express');
const router = express.Router();
const botCoverLearningController = require('../../controllers/learning/botCoverLearningController');

// Route to create a generated paragraph exercise
router.post('/generate-paragraph-exercise', botCoverLearningController.createGenerateParagraphExercise);

module.exports = router;