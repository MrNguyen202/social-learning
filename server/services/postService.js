const supabase = require("../lib/supabase").supabase;

const postService = {
  async createOrUpdatePost(post) {
    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async getPosts(currentUserId, limit) {
    let query = supabase
      .from("posts")
      .select(
        `
          id,
          created_at,
          content,
          file,
          userId,
          original_name,
          user:users(id, name, nick_name, avatar),
          postLikes(id, postId, userId),
          comments(count)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // lọc theo các bài posts không có currentUserId
    // if (currentUserId) {
    //   query = query.neq("userId", currentUserId);
    // }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  },

  async getPostsByUserId(userId) {
    let query = supabase
      .from("posts")
      .select(
        `
          id,
          created_at,
          content,
          file,
          userId,
          original_name,
          user:users(id, name, nick_name, avatar),
          postLikes(id, postId, userId),
          comments(count)
        `
      )
      .order("created_at", { ascending: false });

    // lọc theo các bài posts của user đó
    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  },

  async getPostById(postId) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          nick_name,
          avatar
        )
      `
      )
      .eq("id", postId)
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async deletePost(postId, userId) {
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("userId", userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async likePost(postLike) {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async unLikePost(postId, userId) {
    const { data, error } = await supabase
      .from("postLikes")
      .delete()
      .eq("postId", postId)
      .eq("userId", userId);

    if (error) throw error;

    return { data, error: null };
  },
};

module.exports = postService;
