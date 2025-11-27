import api from "@/lib/api";

// Tạo đơn hàng mới
export const createOrder = async (planId: number) => {
    const response = await api.post("/api/orders/create", { planId });
    return response.data;
};

// Lấy thông tin đơn hàng theo ID
export const getOrder = async (orderId: string) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, paidAmount: number, status: string) => {
    const response = await api.put(`/api/orders/update-status`, { orderId, paidAmount, status });
    return response.data;
};