const supabase = require("../lib/supabase").supabase;

const postService = {
  async createPost(post) {
    const { data, error } = await supabase
      .from("posts")
      .insert(post)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async updatePost(post) {
    if (!post.id) throw new Error("Missing post.id for update");

    // tách payload để không update id/created_at
    const { id, created_at, ...payload } = post;

    // chỉ update các trường cần thiết
    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  async getPosts(currentUserId, limit, offset) {
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
      .range(offset, offset + limit - 1);

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

  // lấy tổng số bài post của 1 user
  async countPostsByUserId(userId) {
    const { count, error } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId);

    if (error) throw error;
    
    return { count, error: null };
  },

  async getPostById(postId) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        ` 
        id,
        created_at,
        content,
        file,
        original_name,
        user:users(id, name, nick_name, avatar),
        postLikes(id, postId, userId),
        comments(*, user: users(id, name, nick_name, avatar))
        `
      )
      .eq("id", postId)
      .order("created_at", { foreignTable: "comments", ascending: false })
      .single();

    if (error) throw error;

    return { data, error: null };
  },

  async deletePost(postId) {
    await Promise.all([
      supabase.from("postLikes").delete().eq("postId", postId),
      supabase.from("comments").delete().eq("postId", postId),
    ]);
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .select();

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
      .eq("userId", userId)
      .select();

    if (error) throw error;

    return { data, error: null };
  },

  async fetchComments(postId) {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        created_at,
        content,
        postId,
        user: users(id, name, nick_name, avatar)
      `
      )
      .eq("postId", postId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { data, error: null };
  },

  async addComment(comment) {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  async deleteComment(commentId) {
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return { data, error: null };
  },
};

module.exports = postService;
