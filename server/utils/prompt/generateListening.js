module.exports = (level, topic) => `
Bạn là một chuyên gia ngôn ngữ Anh. Hãy giúp tôi tạo một bài tập nghe(một đoạn văn hoặc một đoạn hội thoại) bằng tiếng Anh.
Yêu cầu:
1. Bài tập nghe phải phù hợp với trình độ ${level}). Với level càng cao thì mật độ từ vựng ẩn càng nhiều và độ khó nghe càng cao.
2. Bài tập nghe phải liên quan đến chủ đề ${topic}.
3. Bài tập nghe nên theo dạng của toeic, ielts, cambridge.
4. Bài tập nghe nên có nhiều từ đục lỗ hơn. Bao gồm cả danh từ, động từ, tính từ, trạng từ, giới từ, liên từ, động từ to be, động từ khiếm khuyết và những từ phổ biến khác.
Trả lời bằng định dạng JSON với cấu trúc sau:
{
"title_en": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Anh",
"title_vi": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Việt",
"description": "Mô tả ngắn gọn về bài tập nghe bằng tiếng Việt",
"text_content": "Nội dung bài tập nghe bằng tiếng Anh(bản gốc, không đánh dấu chỗ trống đục lỗ)",
"word_hiddens": ["Danh sách các từ bị ẩn(chỗ trống đục lỗ) trong bài tập nghe"],
}

Đây là một ví dụ hoàn hảo về kết quả tôi mong muốn:

{
  "title_en": "Planning a Weekend Trip",
  "title_vi": "Lên kế hoạch cho chuyến đi cuối tuần",
  "description": "Một đoạn hội thoại giữa hai người bạn đang lên kế hoạch cho một chuyến đi ngắn vào cuối tuần.",
  "text_content": "Hey Mark, I was thinking we should plan a trip for next weekend. I feel like we really need a break from work. That sounds like a wonderful idea, Sarah! Where do you have in mind? I was considering either the mountains or the beach. Both options seem very appealing to me. The weather forecast says it will be sunny, which is perfect for either destination. I think I prefer the beach because we can relax on the sand and swim in the ocean.",
  "word_hiddens": ["plan", "next", "weekend", "break", "work", "wonderful", "idea", "have", "mind", "considering", "mountains", "beach", "options", "appealing", "forecast", "sunny", "perfect", "destination", "prefer", "relax", "sand", "swim", "ocean"]
}

Bây giờ, hãy tạo một bài tập mới dựa trên yêu cầu và ví dụ trên.
`;