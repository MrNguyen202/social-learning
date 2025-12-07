const learningService = require('../../services/learning/learningService');
const roadmapService = require('../../services/learning/roadMapService');
const scoreUserService = require('../../services/learning/scoreUserService');
const generateRoadMap = require('../../utils/prompt/generateRoadMap');
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const roadMapController = {
    // Get roadmap by userId
    getRoadmapByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const roadmap = await roadmapService.getRoadmapByUserId(userId);
            return res.json(roadmap);
        } catch (error) {
            console.error("❌ Lỗi khi lấy lộ trình:", error);
            return res.status(500).json({ error: "Lỗi khi lấy lộ trình" });
        }
    },

    // Get roadmap and lessons by userId
    getRoadmapAndLessonsById: async (req, res) => {
        try {
            const { roadmapId } = req.params;
            const roadmap = await roadmapService.getRoadmapAndLessonsById(roadmapId);
            return res.json(roadmap);
        } catch (error) {
            console.error("❌ Lỗi khi lấy lộ trình và bài học:", error);
            return res.status(500).json({ error: "Lỗi khi lấy lộ trình và bài học" });
        }
    },

    // Create roadmap for user
    createRoadMapForUser: async (req, res) => {
        try {
            const { userId, input } = req.body;
            if (!userId || !input) {
                return res.status(400).json({ error: "Missing userId or input" });
            }

            // Lấy thông tin profile & exercise list
            const profileUser = {
                writingScore: await scoreUserService.getScoreStatisticsBySkill(userId, "writing"),
                listeningScore: await scoreUserService.getScoreStatisticsBySkill(userId, "listening"),
                speakingScore: await scoreUserService.getScoreStatisticsBySkill(userId, "speaking"),
                achievements: await scoreUserService.getUserAchievements(userId),
            };

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

            // Sinh prompt mới
            const prompt = generateRoadMap(input, profileUser, exerciseList);

            const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const match = text.match(/\{[\s\S]*\}/);
            if (!match) {
                return res.status(500).json({ error: "Gemini không trả JSON hợp lệ", raw: text });
            }

            const json = JSON.parse(match[0]);

            // Lưu roadmap tổng thể (song ngữ)
            const savedRoadmap = await roadmapService.createRoadmapForUser(userId, {
                totalWeeks: json.totalWeeks,
                field_vi: json.field_vi,
                field_en: json.field_en,
                goal_vi: json.goal_vi,
                goal_en: json.goal_en,
                pathName_vi: json.pathName_vi,
                pathName_en: json.pathName_en,
                targetSkills: input.targetSkills,
                studyPlan: input.studyPlan.minutesPerDay,
            });

            const roadmapId = savedRoadmap[0].id;

            // Lưu từng tuần và bài học
            for (const week of json.weeks) {
                const savedWeek = await roadmapService.createWeekRoadmaps(roadmapId, {
                    week: week.week,
                    focus_vi: week.focus_vi,
                    focus_en: week.focus_en,
                });

                const weekId = savedWeek[0].id;

                // Lưu lessons
                for (const lesson of week.lessons) {
                    await roadmapService.createLessonRoadmap(weekId, {
                        type: lesson.type,
                        level_vi: lesson.level_vi,
                        level_en: lesson.level_en,
                        topic_vi: lesson.topic_vi,
                        topic_en: lesson.topic_en,
                        description_vi: lesson.description_vi,
                        description_en: lesson.description_en,
                        quantity: lesson.quantity,
                    });
                }
            }

            return res.json({ message: "✅ Tạo lộ trình thành công", roadmap: json });

        } catch (error) {
            console.error("❌ Lỗi khi tạo lộ trình:", error);
            return res.status(500).json({ error: "Lỗi khi tạo lộ trình" });
        }
    },

    // update completedCount of lessonRoadmap
    updateLessonCompletedCount: async (req, res) => {
        try {
            const { userId, levelId, topicId, typeExercise } = req.body;
            await roadmapService.updateLessonCompletedCount(userId, levelId, topicId, typeExercise);
            return res.json({ message: "Cập nhật completedCount thành công" });
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật completedCount:", error);
            return res.status(500).json({ error: "Lỗi khi cập nhật completedCount" });
        }
    },

    applyRoadmapForUser: async (req, res) => {
        try {
            const { userId, roadmapId, roadmapOldId } = req.body;
            if (!userId || !roadmapId) {
                return res.status(400).json({ error: "Thiếu userId hoặc roadmapId hoặc roadmapOldId" });
            }
            await roadmapService.applyRoadmapForUser(roadmapId, roadmapOldId);
            return res.json({ message: "Áp dụng lộ trình thành công" });
        } catch (error) {
            console.error("❌ Lỗi khi áp dụng lộ trình:", error);
            return res.status(500).json({ error: "Lỗi khi áp dụng lộ trình" });
        }
    },

};

module.exports = roadMapController;
