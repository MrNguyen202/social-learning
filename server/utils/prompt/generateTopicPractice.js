module.exports = (topic, words) => `
Bạn là một chuyên gia giảng dạy tiếng Anh. Hãy tạo **bài ôn tập tổng hợp (Mixed Practice)** cho chủ đề "${topic}".

Dưới đây là danh sách từ vựng người học cần ôn:
${JSON.stringify(words)}

Yêu cầu:
1. Bài ôn gồm 4 loại câu hỏi:
   - "multiple_choice": chọn nghĩa đúng (4 đáp án)
   - "sentence_order": sắp xếp các từ thành câu đúng
   - "synonym_match": ghép cặp từ đồng nghĩa (Anh–Anh hoặc Anh–Việt)
   - "speaking": nói lại câu hoặc từ (kèm ví dụ)
2. Tổng cộng khoảng 10–12 câu hỏi, ngẫu nhiên, xen kẽ 3–4 loại trên.
3. Mỗi phần tử phải có:
   - "id": số thứ tự
   - "type": loại bài ("multiple_choice" | "sentence_order" | "synonym_match" | "speaking")
   - "question": nội dung yêu cầu
   - "data": thông tin chi tiết (ví dụ: options, câu ví dụ, danh sách từ...)
4. Dạng JSON như sau:
\`\`\`json
{
  "type": "mixed",
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "What does 'develop' mean?",
      "data": {
        "word": "develop",
        "options": [
          "To destroy something",
          "To improve or make something grow",
          "To hide something",
          "To sell a product"
        ],
        "correct_index": 1
      }
    },
    {
      "id": 5,
      "type": "sentence_order",
      "question": "Arrange the words to make a correct sentence.",
      "data": {
        "shuffled": ["she", "quickly", "skills", "developed", "her"],
        "answer": "She developed her skills quickly."
      }
    },
    {
      "id": 9,
      "type": "synonym_match",
      "question": "Match the synonyms correctly.",
      "data": {
        "pairs": [
          { "a": "happy", "b": "joyful" },
          { "a": "angry", "b": "furious" }
        ]
      }
    },
    {
      "id": 11,
      "type": "speaking",
      "question": "Repeat the following sentence aloud:",
      "data": {
        "sentence": "She developed her skills quickly.",
        "ipa": "/ʃiː dɪˈvɛləpt hɜː skɪlz ˈkwɪkli/"
      }
    }
  ]
}
\`\`\`
5. Trả về **JSON thuần**, không có mô tả hoặc giải thích thêm.
`;
