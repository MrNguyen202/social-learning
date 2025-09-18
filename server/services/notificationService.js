const supabase = require("../lib/supabase").supabase;

const notificationService = {
  async createNotification(notification) {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return { data, error };
  },

  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .single();

    if (error) throw error;

    return { data, error };
  },

  async fetchNotifications(receiverId) {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
          *,
          sender: senderId(id, name, avatar, nick_name)
        `
      )
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error };
  },
};

module.exports = notificationService;
