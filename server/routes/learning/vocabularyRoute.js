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

// Route to update mastery score via RPC
router.post("/update_mastery_score_rpc", vocabularyController.updateMasteryScoreRPC);

// Route to archive mastered word via RPC
router.post("/archive_mastered_word_rpc", vocabularyController.archiveMasteredWordRPC);

// Route to reset review word via RPC
router.post("/reset_review_word_rpc", vocabularyController.resetReviewWordRPC);

// Route to delete personal vocab via RPC
router.delete("/delete_personal_vocab_rpc", vocabularyController.deletePersonalVocabRPC);

// Route to delete user vocab errors via RPC
router.delete("/delete_user_vocab_errors_rpc", vocabularyController.deleteUserVocabErrorsRPC);

// Route to get vocab details for review via RPC
router.get("/vocab_details_for_review/:personalVocabId", vocabularyController.getVocabDetailsForReviewRPC);

module.exports = router;
