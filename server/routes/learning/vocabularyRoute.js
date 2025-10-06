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

module.exports = router;
