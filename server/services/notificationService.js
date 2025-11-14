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

  async markAsReadNotificationLearning(notificationLearningId) {
    const { data, error } = await supabase
      .from("notificationsLearning")
      .update({ is_read: true })
      .eq("id", notificationLearningId)
      .select()
      .single();

    if (error) throw error;

    return { data, error };
  },

  async fetchNotificationsLearning(userId) {
    const { data, error } = await supabase
      .from("notificationsLearning")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error };
  },

  async checkForDueReviews(userId) {
    const { error } = await supabase.rpc("check_for_review_notifications", {
      p_user_id: userId,
    });

    if (error) throw error;

    return { data: null, error: null };
  },

  async deleteNotificationLearning(notificationId, personalVocabId) {
    const { data, error } = await supabase
      .from("notificationsLearning")
      .delete()
      .eq("id", notificationId)
      .eq("personalVocabId", personalVocabId);

    if (error) throw error;

    return { data, error };
  },
};

module.exports = notificationService;
