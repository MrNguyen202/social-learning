module.exports = (words) => `
Bạn là một chuyên gia giảng dạy tiếng Anh, chuyên thiết kế các bài ôn tập từ vựng tương tác. Hãy tạo **bài ôn tập tổng hợp (Mixed Practice)** cho danh sách từ vựng.

Dưới đây là danh sách từ vựng người học cần ôn:
${JSON.stringify(words)}

Yêu cầu:
1. Bài ôn gồm 6 loại câu hỏi, tương tự các ứng dụng học từ vựng phổ biến:
    - "multiple_choice": Chọn nghĩa đúng (Anh-Việt hoặc Việt-Anh).
    - "sentence_order": Sắp xếp các từ (word bank) thành câu đúng.
    - "synonym_match": Ghép cặp từ đồng nghĩa hoặc tương ứng (Anh-Anh hoặc Anh-Việt).
    - "speaking": Nói lại câu hoặc từ (kèm ví dụ).
    - "fill_in_blank": Chọn từ đúng để điền vào chỗ trống trong câu.
    - "word_build": Ghép các ký tự (từ ngân hàng chữ cái) thành từ đúng.
2. Tổng cộng khoảng 18–30 câu hỏi, được chia đều hoặc gần đều cho 6 loại trên (mỗi loại khoảng 3–5 câu).
3. Mỗi phần tử phải có:
    - "id": số thứ tự (số nguyên, bắt đầu từ 1 và tăng dần).
    - "type": loại bài ("multiple_choice" | "sentence_order" | "synonym_match" | "speaking" | "fill_in_blank" | "word_build")
    - "question": nội dung yêu cầu (ví dụ: "Từ 'develop' nghĩa là gì?").
    - "data": thông tin chi tiết (options, câu ví dụ, danh sách từ, đáp án...).
4. Dạng JSON như sau:
\`\`\`json
[
  {
    "id": 1,
    "type": "multiple_choice",
    "question": "Từ 'develop' có nghĩa là gì?",
    "data": {
      "word": "develop",
      "options": ["Máy tính", "Cái bàn", "Xe hơi", "Phát triển"],
      "correct_index": 3
    }
  },
  {
    "id": 2,
    "type": "multiple_choice",
    "question": "Từ 'Thành công' trong tiếng Anh là gì?",
    "data": {
      "word": "Thành công",
      "options": ["Successful", "Develop", "Quick", "Table"],
      "correct_index": 0
    }
  },
  {
    "id": 5,
    "type": "sentence_order",
    "question": "Sắp xếp các từ để tạo thành câu đúng",
    "data": {
      "shuffled": ["she", "quickly", "skills", "developed", "her"],
      "answer_en": "She developed her skills quickly",
      "answer_vi": "Cô ấy phát triển kỹ năng của mình nhanh chóng"
    }
  },
  {
    "id": 9,
    "type": "synonym_match",
    "question": "Ghép cặp từ đồng nghĩa",
    "data": {
      "pairs": [
        { "a": "happy", "b": "Hạnh phúc" },
        { "a": "angry", "b": "Tức giận" },
        { "a": "quick", "b": "Nhanh" },
        { "a": "slow", "b": "Chậm" },
        { "a": "car", "b": "Xe hơi" }
      ]
    }
  },
  {
    "id": 12,
    "type": "speaking",
    "question": "Nói lại từ sau",
    "data": {
      "sentence": "successfully",
      "ipa": "/səkˈsɛsfəli/",
      "sentence_vi": "Thành công"
    }
  },
  {
    "id": 14,
    "type": "fill_in_blank",
    "question": "Chọn từ đúng để điền vào chỗ trống",
    "data": {
      "sentence_template": "We need to ___ a new plan",
      "sentence_vi": "Chúng ta cần phát triển một kế hoạch mới",
      "options": ["develop", "eat", "run", "happy"],
      "correct_answer": "develop"
    }
  },
  {
    "id": 17,
    "type": "word_build",
    "question": "Ghép các chữ cái để tạo thành từ đúng",
    "data": {
      "letters": ["d", "e", "v", "e", "l", "o", "p", "a", "s", "k"],
      "answer": "develop",
      "hint": "Phát triển"
    }
  }
]
\`\`\`
5. Trả về **JSON hợp lệ**, không có ký tự markdown (\`\`\`), không có mô tả hoặc giải thích thêm.
6. Kết quả phải là một mảng JSON hợp lệ gồm các đối tượng bài tập, không có object bao ngoài.
7. Mỗi câu hỏi hoặc câu ví dụ không vượt quá 15 từ.
8. Mỗi câu hỏi phải liên quan trực tiếp đến ít nhất một từ trong danh sách từ vựng ở trên.
9. Không sử dụng ký tự đặc biệt trong câu hỏi hoặc câu trả lời (ngoại trừ '___' cho 'fill_in_blank').
10. Không được lặp lại cùng một từ hoặc cấu trúc câu hỏi quá 2 lần.
11. Ở loại "synonym_match", hãy tạo 5 cặp từ.
12. Ở loại "fill_in_blank", "sentence_template" phải có một chỗ trống biểu thị bằng \`___\`. "options" gồm 3-4 từ, trong đó "correct_answer" là một từ trong danh sách từ vựng.
13. Ở loại "sentence_order", các câu trong "answer_en" và "answer_vi" **không được chứa dấu câu ở cuối** (như ., !, ?) và phải bao gồm tất cả các từ có trong answer_en", *kể cả các từ lặp lại* (ví dụ: he put the paper in the box) có 2 chữ 'the'.
14. Ở loại "multiple_choice", hãy cố gắng tạo cả câu hỏi Anh-Việt (ví dụ: 'develop' nghĩa là gì?) và Việt-Anh (ví dụ: 'Phát triển' là gì?).
15. Ở loại "word_build":
    - "letters" là mảng ký tự a–z, khoảng 8–12 ký tự.
    - Phải bao gồm *tất cả* các ký tự trong "answer", *kể cả các ký tự lặp lại* (ví dụ: 'always' phải cung cấp 2 chữ 'a', 'develop' phải cung cấp 2 chữ 'e'), và thêm 3–5 ký tự nhiễu.
    - Thứ tự các ký tự được xáo trộn ngẫu nhiên.
    - "hint" là nghĩa tiếng Việt của từ "answer" để gợi ý.
16. Mỗi từ trong danh sách chỉ được xuất hiện tối đa một lần trong loại "word_build".
17. Nếu câu có số là thời gian ( ví dụ: 7 am, 12 pm, 7:00 am, 12:00 pm ...), hãy chuyển thành dạng 7:00, 12:00 ...
`;