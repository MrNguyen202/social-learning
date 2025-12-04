const { speechToTextClient } = require("../../lib/speechToText");

const supabase = require("../../lib/supabase").supabase;

const speakingService = {
  // Get list speaking by topic and level
  async getSpeakingByTopicAndLevel(levelId, topicId) {
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const { data, error } = await supabase
      .from("speakingLessons")
      .select("id, content, topic_id, level_id")
      .eq("topic_id", topicId)
      .eq("level_id", levelId);

    if (error) return { data: null, error };

    const random10 = shuffle(data).slice(0, 10);

    return { data: random10, error: null };
  },

  async speechToText(audioContent, encoding = 'WEBM_OPUS', sampleRate = 48000) {
    try {
      const request = {
        audio: {
          content: audioContent,
        },
        config: {
          encoding: encoding, // Chuẩn format ghi âm từ trình duyệt
          sampleRateHertz: sampleRate,
          languageCode: "en-US", // Có thể truyền dynamic nếu muốn
          enableAutomaticPunctuation: true,
        },
      };

      const [response] = await speechToTextClient.recognize(request);

      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      return transcription;
    } catch (error) {
      console.error("Google Speech Service Error:", error);
      throw error;
    }
  },
};

module.exports = speakingService;
