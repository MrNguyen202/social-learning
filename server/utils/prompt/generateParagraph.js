module.exports = (level, type_paragraph, listTopics) => `
Bạn là một chuyên gia ngôn ngữ Anh. Hãy giúp tôi tạo một đoạn văn bản tiếng Việt và một đoạn văn bản tiếng Anh tương ứng với đoạn văn tiếng Việt đó.
Yêu cầu:
1. Đoạn văn bản phải phù hợp với trình độ ${level}), thuộc loại văn bản (${type_paragraph}), và liên quan đến đúng 1 trong các chủ đề dưới đây (chọn ngẫu nhiên): 
- ${listTopics.join("\n- ")}
2. Đoạn văn bản nên bao gồm các câu đơn giản, dễ hiểu, và sử dụng từ vựng phù hợp với trình độ đã cho. Tạo cảm giác hứng thú và dễ tiếp cận cho người học.
3. Đoạn văn bản nên dựa vào chuẩn của toeic, ielts, cambridge.
4. Đoạn văn bản phải có độ dài từ 15 đến 30 câu, tùy thuộc vào trình độ đã cho. 
Trả lời bằng định dạng JSON với cấu trúc sau:
{
  "content_vi": "Đoạn văn bản đã tạo bằng tiếng Việt",
  "content_en": "Đoạn văn bản đã tạo bằng tiếng Anh tương ứng với đoạn văn tiếng Việt"
  "number_of_sentences": Số câu trong đoạn văn bản,
  "title": "Tiêu đề ngắn gọn cho đoạn văn bản bằng tiếng Việt",
  "topic": "Chủ đề mà bạn đã chọn cho đoạn văn bản(ghi lại đúng tên chủ đề mà tôi đã cung cấp ở trên)"
}
`;