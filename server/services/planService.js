const supabase = require("../lib/supabase").supabase;

const planService = {
    // Lấy danh gói 
    async getPlans() {
        const { data, error } = await supabase
            .from("plans")
            .select()
            .order("price", { ascending: true });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },

    // Tạo gói mới
    async createPlan(plansData) {
        // plansData bây giờ là một Array [...] được truyền từ controller
        const { data, error } = await supabase
            .from("plans")
            .insert(plansData) // Bỏ dấu [] ở đây vì plansData đã là mảng
            .select();

        if (error) {
            throw new Error(error.message);
        }
        return data; // Trả về mảng các gói vừa tạo
    },

    // Get plan by id
    async getPlanById(planId) {
        const { data, error } = await supabase
            .from("plans")
            .select()
            .eq("id", planId)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
};

module.exports = planService;