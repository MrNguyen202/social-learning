const express = require("express");
const router = express.Router();
const contentController = require("../../controllers/admin/contentController");

router.get("/listening", contentController.loadListeningParagraphs);
router.get("/writing", contentController.loadWritingExercises);
router.get("/speaking", contentController.loadSpeakingLessons);
router.get("/topics", contentController.loadTopics);
router.get("/levels", contentController.loadLevels);
router.get("/type-exercises", contentController.loadTypeExercises);
router.get("/type-paragraphs", contentController.loadTypeParagraphs);

router.post("/create-listening", contentController.createListeningParagraph);
router.post("/create-speaking", contentController.createSpeakingLesson);
router.post("/create-writing", contentController.createWritingExercise);

router.put("/update-listening/:id", contentController.updateListeningParagraph);
router.put("/update-writing/:id", contentController.updateWritingExercise);

router.delete(
  "/delete-listening/:id",
  contentController.deleteListeningParagraph
);
router.delete("/delete-speaking/:id", contentController.deleteSpeakingLesson);
router.delete("/delete-writing/:id", contentController.deleteWritingExercise);

module.exports = router;
