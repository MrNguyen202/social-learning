const supabase = require("../../lib/supabase").supabase;

const roadmapService = {
    // Lấy lộ trình học tập theo userId
    getRoadmapByUserId: async (userId) => {
        const { data, error } = await supabase.rpc('get_current_week', { user_id_input: userId }).maybeSingle();
        if (error) {
            throw new Error("Lỗi khi lấy lộ trình học tập: " + error.message);
        }
        return data;
    },

    // Lấy lộ trình học tập theo roadmapId (kèm tuần & bài học)
    getRoadmapAndLessonsById: async (roadmapId) => {
        // Lấy roadmap chi tiết theo id
        const { data: roadmap, error: roadmapError } = await supabase
            .from("roadmap")
            .select(`
            id,
            totalWeeks,
            weekRoadMaps (
                id,
                week,
                focus,
                lessonRoadmap (
                    id,
                    type,
                    level,
                    topic,
                    description,
                    quantity,
                    completedCount,
                    isCompleted
                )
            )
        `)
            .eq("id", roadmapId)
            .order("week", { ascending: true, foreignTable: "weekRoadMaps" })
            .single();

        if (roadmapError) {
            throw new Error("Lỗi khi lấy lộ trình học tập: " + roadmapError.message);
        }

        if (!roadmap) {
            return null;
        }

        // Chuyển dữ liệu từ DB sang format giống localData
        const formattedData = {
            totalWeeks: roadmap.totalWeeks,
            weeks: roadmap.weekRoadMaps.map((week) => ({
                week: week.week,
                focus: week.focus,
                lessons: week.lessonRoadmap.map((lesson) => ({
                    type: lesson.type,
                    level: lesson.level,
                    topic: lesson.topic,
                    description: lesson.description,
                    quantity: lesson.quantity,
                    completedCount: lesson.completedCount || 0,
                    isCompleted: lesson.isCompleted || false,
                })),
            })),
        };

        return formattedData;
    },

    // Tạo mới lộ trình học tập cho userId
    createRoadmapForUser: async (userId, roadmapData) => {
        const { data, error } = await supabase
            .from("roadmap")
            .insert({
                user_id: userId,
                totalWeeks: roadmapData.totalWeeks,
                field: roadmapData.field,
                goal: roadmapData.goal,
                targetSkills: roadmapData.targetSkills,
                pathName: roadmapData.pathName,
                studyPlan: roadmapData.studyPlan,
            })
            .select();
        if (error) {
            throw new Error("Lỗi khi lưu lộ trình học tập: " + error.message);
        }
        return data;
    },

    // createWeekRoadmaps
    createWeekRoadmaps: async (roadmapId, weeksData) => {
        const { data, error } = await supabase
            .from("weekRoadMaps")
            .insert({
                roadmap_id: roadmapId,
                week: weeksData.week,
                focus: weeksData.focus,
            })
            .select();
        if (error) {
            throw new Error("Lỗi khi lưu tuần lộ trình học tập: " + error.message);
        }
        return data;
    },

    // createLessonRoadmap
    createLessonRoadmap: async (weekRoadMap_id, lessonData) => {
        const { data, error } = await supabase
            .from("lessonRoadmap")
            .insert({
                week_roadmap_id: weekRoadMap_id,
                type: lessonData.type,
                level: lessonData.level,
                topic: lessonData.topic,
                description: lessonData.description,
                quantity: lessonData.quantity,
                isCompleted: false,
            })
            .select();
        if (error) {
            throw new Error("Lỗi khi lưu bài học vào lộ trình: " + error.message);
        }
        return data;
    }
};

module.exports = roadmapService;