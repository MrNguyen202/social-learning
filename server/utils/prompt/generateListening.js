module.exports = (level, topic) => `
Bạn là một chuyên gia ngôn ngữ Anh. Hãy giúp tôi tạo một bài tập nghe (một đoạn văn nói như part 4 của bài thi TOEIC) bằng tiếng Anh.

Yêu cầu:
1. Bài tập nghe phải phù hợp với trình độ ${level}.
2. Bài tập nghe phải liên quan đến chủ đề ${topic}.
3. Bài tập nghe nên theo dạng của TOEIC, IELTS hoặc Cambridge.

YÊU CẦU QUAN TRỌNG VỀ ĐỊNH DẠNG:
Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác.

Cấu trúc JSON bắt buộc phải như sau:
{
  "title_en": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Anh",
  "title_vi": "Tiêu đề ngắn gọn cho bài tập nghe bằng tiếng Việt",
  "description_en": "Mô tả ngắn gọn về bài tập nghe bằng tiếng Anh",
  "description_vi": "Mô tả ngắn gọn về bài tập nghe bằng tiếng Việt",
  "text_content": "NỘI DUNG GỐC của bài nghe. Đây PHẢI LÀ một đoạn văn bản sạch, đầy đủ, không có lỗi chính tả, không dính chữ và TUYỆT ĐỐI KHÔNG được chứa bất kỳ ký tự đục lỗ nào (như __1__ hay [...]). Toàn bộ nội dung bài nghe phải nằm ở đây để tôi có thể tạo file audio.",
  "word_hiddens": [
    "Danh sách các từ sẽ bị ẩn. Bạn phải chọn nhiều từ từ 'text_content' để đưa vào đây.",
    "Hãy chọn đa dạng các loại từ: danh từ, động từ, tính từ, trạng từ, giới từ, liên từ, to be, động từ khiếm khuyết, v.v.",
    "Mật độ từ ẩn (số lượng từ trong mảng này) phải phù hợp với trình độ ${level}."
  ]
}

VÍ DỤ HOÀN HẢO:
{
  "title_en": "Planning a Weekend Trip",
  "title_vi": "Lên kế hoạch cho chuyến đi cuối tuần",
  "description_en": "A short description of the listening exercise in English.",
  "description_vi": "Một đoạn văn nói về việc lên kế hoạch cho một chuyến đi cuối tuần.",
  "text_content": "Hey Mark, I was thinking we should plan a trip for next weekend. I feel like we really need a break from work. That sounds like a wonderful idea, Sarah! Where do you have in mind? I was considering either the mountains or the beach. Both options seem very appealing to me. The weather forecast says it will be sunny, which is perfect for either destination. I think I prefer the beach because we can relax on the sand and swim in the ocean.",
  "word_hiddens": ["plan", "next", "weekend", "break", "work", "wonderful", "idea", "have", "mind", "considering", "mountains", "beach", "options", "appealing", "forecast", "sunny", "perfect", "destination", "prefer", "relax", "sand", "swim", "ocean"]
}

LƯU Ý CUỐI CÙNG (RẤT QUAN TRỌNG):
- KHÔNG được chèn các ký tự như '__1__', '__2__' vào trường 'text_content'.
- Trường 'text_content' phải là văn bản gốc, đầy đủ để tôi có thể dùng nó tạo file audio.
- Trường 'word_hiddens' phải là một mảng (Array) các chuỗi (String) được lấy từ 'text_content'.

Bây giờ, hãy tạo bài tập mới cho chủ đề '${topic}' và trình độ '${level}'.
`;