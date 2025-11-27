const supabase = require("../lib/supabase").supabase;

const orderService = {
    // Tạo đơn hàng mới
    async createOrder(orderData) {
        const { data, error } = await supabase
            .from("orders")
            .insert(orderData)
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },

    // Lấy đơn hàng theo user_id và trạng thái
    async getOrdersByUserAndStatus(userId, status) {
        const { data, error } = await supabase
            .from("orders")
            .select()
            .eq("user_id", userId)
            .eq("status", status)
            .order("created_at", { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },

    // Get order by order_code
    async getOrderByOrderCode(orderCode) {
        const { data, error } = await supabase
            .from("orders")
            .select()
            .eq("order_code", orderCode)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },

    // Cập nhật đơn hàng
    async updateOrderStatus(orderId, paidAmount, status) {
        const { data, error } = await supabase
            .from("orders")
            .update({
                status: status,
                updated_at: new Date().toISOString(),
                paid_amount: paidAmount
            })
            .eq("id", orderId)
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
};

module.exports = orderService;