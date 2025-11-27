const planService = require("../services/planService");

const planController = {
    // Lấy danh sách gói
    getPlans: async (req, res) => {
        try {
            const plans = await planService.getPlans();
            res.status(200).json(plans);
        } catch (error) {
            console.error("Error fetching plans:", error);
            res.status(500).json({ error: error.message });
        }
    },

    createPlan: async (req, res) => {
        try {
            // req.body lúc này mong đợi là một Array: [{...}, {...}]
            const newPlans = await planService.createPlan(req.body);

            res.status(201).json({
                message: `Đã thêm thành công ${newPlans.length} gói`,
                data: newPlans
            });
        } catch (error) {
            console.error("Error creating plans:", error);
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = planController;