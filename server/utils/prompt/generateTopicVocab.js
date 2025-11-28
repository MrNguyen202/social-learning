// chưa làm

module.exports = (words, existingTopics) => `
Bạn là một chuyên gia ngôn ngữ tiếng Anh. 
Nhiệm vụ của bạn là giúp phân loại các từ vựng sau đây vào các chủ đề (topic) phù hợp.

### Danh sách từ cần phân loại:
${words.map((w) => `- ${w}`).join("\n")}

### Danh sách topic hiện có của người dùng:
${
  existingTopics.length > 0
    ? existingTopics.map((t) => `- ${t.name_en}`).join("\n")
    : "(Chưa có topic nào)"
}

### Yêu cầu:
1. Mỗi từ vựng phải được gán **1 hoặc nhiều topic phù hợp** dựa theo nghĩa và ngữ cảnh sử dụng.
2. Nếu từ thuộc topic đã có trong danh sách "existingTopics" → sử dụng lại topic đó.
3. Nếu chưa có topic phù hợp → tạo topic mới.
4. Mỗi topic mới phải có:
   - "name_en": tên topic bằng tiếng Anh, ngắn gọn, dễ hiểu (1-2 từ).
   - "name_vi": bản dịch ngắn gọn bằng tiếng Việt, chính xác và tự nhiên.
5. Không trùng lặp topic trong cùng một từ.
6. Trả về **JSON chuẩn**, không chứa văn bản mô tả hoặc ký tự đặc biệt, chỉ gồm mảng đối tượng.

\`\`\`json
[
  {
  "word": "please",
  "topics": [
    { "name_en": "Daily Conversation", "name_vi": "Hội thoại hàng ngày" },
    { "name_en": "Politeness", "name_vi": "Sự lịch sự" }
  ]
  },
  {
    "word": "apple",
    "topics": [
      { "name_en": "Food", "name_vi": "Thức ăn" },
      { "name_en": "Fruits", "name_vi": "Trái cây" }
    ]
  },
]
\`\`\`
`;
