const express = require('express');
const router = express.Router();
const speakingController = require('../../controllers/learning/speakingController');

// Get list speaking exercises by level and topic
router.get('/:levelId/:topicId', speakingController.getSpeakingByTopicAndLevel);

router.post('/recognize', speakingController.transcribeAudio);

module.exports = router;