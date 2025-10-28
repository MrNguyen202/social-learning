const express = require("express");
const router = express.Router();
const vocabularyController = require("../../controllers/learning/vocabularyController");

// Route to insert vocabulary data
router.post("/insert", vocabularyController.insertOrUpdateVocabulary);

// Route to delete vocabulary errors
router.delete("/delete", vocabularyController.deleteVocabularyErrors);

// Route to get personal vocabulary list by user ID and error count
router.get(
  "/list/:userId",
  vocabularyController.getListPersonalVocabByUserIdAndErrorCount
);

// Route to get personal vocabulary list by user ID and related words
router.get(
  "/related_words/:userId",
  vocabularyController.getListPersonalVocabByUserIdAndRelatedWord
);

// Route to get personal vocabulary list by user ID and created = true
router.get(
  "/created/:userId",
  vocabularyController.getListPersonalVocabByUserIdAndCreated
);

// Route to get personal vocabulary by ID
router.get("/:personalVocabId", vocabularyController.getPersonalVocabById);

// Route to get personal vocabulary by mastery score range
router.get(
  "/mastery_score/:userId/:from/:to",
  vocabularyController.getSumPersonalVocabByMasteryScore
);

// Route to get all personal topic vocabulary
router.get(
  "/topics/all/:userId",
  vocabularyController.getPersonalVocabAllTopic
);

// Route to get personal vocabulary by topic
router.get(
  "/topics/:userId/:topic",
  vocabularyController.getPersonalVocabByTopic
);

// Route to get user topic
router.get("/user_topics/:userId", vocabularyController.getUserTopics);

// Route to get vocab by topic
router.get("/vocab_topic/:userId/:topicId", vocabularyController.getVocabByTopic);

module.exports = router;
