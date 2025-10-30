const learningService = require('../../services/learning/learningService');
const scoreUserService = require('../../services/learning/scoreUserService');
const generateRoadMap = require('../../utils/prompt/generateRoadMap');
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const roadMapController = {
    createRoadMapForUser: async (req, res) => {
        try {
            const { userId, input } = req.body;

            if (!userId || !input) {
                return res.status(400).json({ error: "Missing userId or input" });
            }

            // 🧠 Lấy thông tin người dùng để customize roadmap
            const profileUser = {
                writingScore: await scoreUserService.getScoreStatisticsBySkill(userId, "writing"),
                listeningScore: await scoreUserService.getScoreStatisticsBySkill(userId, "listening"),
                speakingScore: await scoreUserService.getScoreStatisticsBySkill(userId, "speaking"),
                achievements: await scoreUserService.getUserAchievements(userId),
            };

            // 🧩 Lấy danh sách bài tập
            const exerciseList = {
                writing: {
                    levels: await learningService.getAllLevels(),
                    typeParagraph: await learningService.getAllTypeParagraphs(),
                    topics: await learningService.getAllTopics(),
                },
                listening: {
                    levels: await learningService.getAllLevels(),
                    topics: await learningService.getAllTopics(),
                },
                speaking: {
                    levels: await learningService.getAllLevels(),
                    topics: await learningService.getAllTopics(),
                },
            };

            // 🪄 Sinh prompt AI
            const prompt = generateRoadMap(input, profileUser, exerciseList);

            // 🚀 Gọi Gemini sinh roadmap
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // 🧹 Parse JSON
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) {
                return res.status(500).json({ error: "Gemini không trả JSON hợp lệ", raw: text });
            }

            const json = JSON.parse(match[0]);

            // TODO: lưu json xuống DB
            console.log("✅ Roadmap JSON:", JSON.stringify(json, null, 2));


            return res.json({ message: "Tạo lộ trình thành công", roadmap: json });

        } catch (error) {
            console.error("❌ Lỗi khi tạo lộ trình:", error);
            return res.status(500).json({ error: "Lỗi khi tạo lộ trình" });
        }
    }
};

module.exports = roadMapController;
