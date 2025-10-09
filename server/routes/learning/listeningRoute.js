const express = require('express');
const router = express.Router();
const listeningController = require('../../controllers/learning/listeningController');

// Get listening exercise by id
router.get('/listening-exercises/:id', listeningController.getListeningExerciseById);

// Get all listening exercises by level_slug and topic_slug
router.get('/listening-exercises/level/:level_slug/topic/:topic_slug', listeningController.getListeningExercises);

// Submit listening exercise results
router.post('/listening-exercises/submit', listeningController.submitListeningResults);

// Get progress of a user for a specific listening exercise
router.get('/listening-exercises/progress/:user_id/:listen_para_id', listeningController.getUserProgress);

module.exports = router;