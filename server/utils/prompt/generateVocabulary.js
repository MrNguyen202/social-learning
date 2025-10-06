module.exports = (word) => `
Bạn là một chuyên gia ngôn ngữ tiếng Anh. Hãy giúp tôi tạo một danh sách các từ vựng liên quan đến từ "${word}".

Yêu cầu:
1. Danh sách gồm từ 5 đến 10 từ liên quan (bao gồm gốc từ, biến thể, từ đồng nghĩa, trái nghĩa hoặc các từ thường đi kèm).
2. Mỗi từ phải có:
   - "id": số thứ tự (bắt đầu từ 1, tăng dần).
   - "word": từ vựng tiếng Anh.
   - "word_vi": nghĩa ngắn gọn bằng tiếng Việt.
   - "meaning": giải thích ngắn bằng tiếng Anh (1 câu).
   - "meaning_vi": giải thích ngắn bằng tiếng Việt (1 câu).
   - "example": một câu ví dụ ngắn gọn (3–8 từ).
   - "example_vi": bản dịch tiếng Việt của câu ví dụ.
   - "ipa": phiên âm quốc tế của từ.
   - "word_type": loại từ (danh từ, động từ, tính từ, trạng từ, giới từ, liên từ, đại từ, thán từ). Kết quả phải bao gồm loại từ tiếng Anh và tiếng Việt.
3. Các từ vựng phải mang ý nghĩa khác nhau, không lặp lại.
4. Không sử dụng kí tự đặc biệt như @, #, $, %, ^, &, *, (, ), -, +, =, v.v.
5. Chỉ trả về JSON thuần, không giải thích.
6. id đầu tiên luôn là từ gốc "${word}".

Định dạng JSON:
[
  {
    "id": 1,
    "word": "từ tiếng Anh",
    "word_vi": "nghĩa tiếng Việt",
    "meaning": "giải thích ngắn tiếng Anh",
    "meaning_vi": "giải thích ngắn tiếng Việt",
    "example": "câu ví dụ ngắn",
    "example_vi": "nghĩa tiếng Việt của câu ví dụ",
    "ipa": "phiên âm quốc tế",
    "word_type": "loại từ (tiếng Anh - tiếng Việt)"
  },
  ...
]
`;
