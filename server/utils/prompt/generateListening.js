module.exports = (level, topic) => `
Bạn là một chuyên gia ngôn ngữ Anh. Hãy giúp tôi tạo một bài tập nghe(một đoạn văn hoặc một đoạn hội thoại) bằng tiếng Anh.
Yêu cầu:
1. Bài tập nghe phải phù hợp với trình độ ${level}).
2. Bài tập nghe phải liên quan đến chủ đề ${topic}.
3. Bài tập nghe nên theo dạng của toeic, ielts, cambridge.
4. Bài tập nghe nên có nhiều từ đục lỗ hơn. Bao gồm cả danh từ, động từ, tính từ, trạng từ, giới từ, liên từ.
5. Mỗi câu phải có ít nhất 2-3 từ bị đục lỗ.
Trả lời bằng định dạng JSON với cấu trúc sau:
{
"title_en": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Anh",
"title_vi": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Việt",
"description": "Mô tả ngắn gọn về bài tập nghe bằng tiếng Việt",
"text_content": "Nội dung bài tập nghe bằng tiếng Anh(bản gốc, không đánh dấu chỗ trống đục lỗ)",
"word_hiddens": ["Danh sách các từ bị ẩn(chỗ trống đục lỗ) trong bài tập nghe"],
}
`;