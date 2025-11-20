const express = require('express');
const router = express.Router();
const botCoverLearningController = require('../../controllers/learning/botCoverLearningController');

// Route to create a generated paragraph exercise
router.post('/generate-paragraph-exercise', botCoverLearningController.createGenerateParagraphExercise);

// Route to create a generated listening exercise
router.post('/generate-listening-exercise', botCoverLearningController.createGenerateListeningExercise);

// Route to feedback writing paragraph exercise
router.post('/feedback-writing-paragraph-exercise', botCoverLearningController.feedbackWritingParagraphExercise);

// Route to create a generated speaking exercise
router.post('/generate-speaking-exercise', botCoverLearningController.createGenerateSpeakingExercise);

// Route to create a generated personal word exercise
router.post('/generate-personal-word-by-AI', botCoverLearningController.createGeneratePersonalWordByAI);

// Route to create a generated conversation practice exercise
router.post('/generate-conversation-practice-by-AI', botCoverLearningController.createGenerateConversationPracticeByAI);

// Route to create a generated words practice exercise
router.post('/generate-words-practice-by-AI', botCoverLearningController.createGenerateWordsPracticeByAI);

// Route to create or update topic vocabularies
router.post("/generate-topics", botCoverLearningController.generateTopicsForUser);

router.post("/generate-topic-speaking", botCoverLearningController.generateTopicSpeaking);

module.exports = router;