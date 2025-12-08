const speakingService = require("../../services/learning/speakingService");

const speakingController = {
  // Get speaking exercise by topic and level
  async getSpeakingByTopicAndLevel(req, res) {
    try {
      const { levelId, topicId } = req.params;
      const { data, error } = await speakingService.getSpeakingByTopicAndLevel(
        levelId,
        topicId
      );
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async transcribeAudio(req, res) {
    try {
      const { audioContent, encoding, sampleRate } = req.body;

      if (!audioContent) {
        return res.status(400).json({
          success: false,
          message: "No audio content provided",
        });
      }

      const transcript = await speakingService.speechToText(audioContent, encoding, sampleRate);

      return res.status(200).json({
        success: true,
        data: {
          transcript: transcript || "",
        },
      });
    } catch (error) {
      console.error("Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to transcribe audio",
      });
    }
  },
};

module.exports = speakingController;
