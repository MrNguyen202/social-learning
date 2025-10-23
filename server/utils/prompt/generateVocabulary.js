module.exports = (word) => `
Bạn là một chuyên gia ngôn ngữ tiếng Anh. Hãy giúp tôi tạo một danh sách các từ vựng liên quan đến từ "${word}".

Yêu cầu:
1. Danh sách gồm từ 5 đến 10 từ liên quan (bao gồm gốc từ, biến thể, từ đồng nghĩa, trái nghĩa hoặc các từ thường đi kèm).
2. Mỗi từ phải có:
   - "topic": một danh từ tiếng Anh duy nhất (không phải cụm từ), dùng để khái quát chủ đề của từ "${word}" và tất cả các từ liên quan.
   - "id": số thứ tự (bắt đầu từ 1, tăng dần).
   - "word": từ vựng tiếng Anh.
   - "word_vi": nghĩa ngắn gọn bằng tiếng Việt.
   - "meaning": giải thích ngắn bằng tiếng Anh (1 câu).
   - "meaning_vi": giải thích ngắn bằng tiếng Việt (1 câu).
   - "example": một câu ví dụ ngắn gọn (3–8 từ).
   - "example_vi": bản dịch tiếng Việt của câu ví dụ.
   - "ipa": phiên âm quốc tế của từ.
   - "word_type": loại từ (danh từ, động từ, tính từ, trạng từ, giới từ, liên từ, đại từ, thán từ). Ghi cả tiếng Anh và tiếng Việt.
3. Các từ vựng phải mang ý nghĩa khác nhau, không lặp lại.
4. "topic" phải là **một từ tiếng Anh duy nhất**, thể hiện rõ chủ đề bao quát của từ "${word}" và các từ liên quan:
   - Nếu từ "${word}" thuộc một lĩnh vực cụ thể (như giáo dục, công nghệ, y tế...), hãy đặt "topic" là từ thể hiện chủ đề đó (ví dụ: "Education", "Technology", "Health"...).
   - Nếu từ "${word}" không thuộc một lĩnh vực rõ ràng nhưng là một từ loại cụ thể (như trạng từ, tính từ, giới từ, liên từ, đại từ, thán từ), hãy đặt "topic" là tên loại từ đó, viết bằng tiếng Anh (ví dụ: "Adverb", "Adjective", "Preposition"...).
   - Nếu không thể xác định được chủ đề hoặc loại từ cụ thể, hãy đặt "topic" là "General".
5. Không sử dụng kí tự đặc biệt như @, #, $, %, ^, &, *, (, ), -, +, =, v.v.
6. Chỉ trả về JSON thuần, không giải thích.
7. id đầu tiên luôn là từ gốc "${word}".

Định dạng JSON:
\`\`\`json
  {
    "topic": "Education",
    "words": [
      {
        "id": "1",
        "word": "study",
        "word_vi": "học tập",
        "meaning": "to learn about a subject through books or practice",
        "meaning_vi": "học một chủ đề thông qua sách hoặc thực hành",
        "example": "She studies every night.",
        "example_vi": "Cô ấy học mỗi tối.",
        "ipa": "/ˈstʌdi/",
        "word_type": "verb - động từ"
      },
      ...
    ]
  }
\`\`\`
`;
