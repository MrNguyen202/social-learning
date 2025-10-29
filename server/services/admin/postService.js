const supabase = require("../../lib/supabase").supabase;

const postService = {
  /**
   * Danh sách bài post với bộ lọc
   */
  async loadPosts({ search, fromDate, toDate }) {
    let query = supabase
      .from("posts")
      .select(
        `
        id,
        content,
        file,
        original_name,
        created_at,
        user:users ( id, name ),
        likes_count:postLikes ( count ),
        comments_count:comments ( count )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    // Áp dụng bộ lọc động
    if (search) {
      query = query.ilike("content", `%${search}%`);
    }
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }
    if (toDate) {
      query = query.lte("created_at", toDate);
    }

    const { data, error } = await query;
    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Bình luận cho một bài post
   */
  async loadPostComments(postId) {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        user:users ( id, name )
      `
      )
      .eq("postId", postId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Cập nhật trạng thái kiểm duyệt của bài post
   * chưa làm/chưa tạo field moderation_status
   */
  async updatePostModerationStatus(postId, status) {
    const { data, error } = await supabase
      .from("posts")
      .update({ moderation_status: status })
      .eq("id", postId)
      .select(); // Trả về bản ghi đã được cập nhật

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Xóa một bài post
   */
  async deletePost(postId) {
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  /**
   * Xóa một bình luận
   */
  async deleteComment(commentId) {
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return { data: null, error };
    return { data, error: null };
  },
};

module.exports = postService;
