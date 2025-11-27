const supabase = require("../lib/supabase").supabase;

const transactionService = {
    // Tạo giao dịch mới
    async createTransaction(transactionData) {
        const { data, error } = await supabase
            .from("transactions")
            .insert(transactionData)
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },

};

module.exports = transactionService;