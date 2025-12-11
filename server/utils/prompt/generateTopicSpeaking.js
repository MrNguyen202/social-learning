module.exports = (topic) => `
Bạn là một chuyên gia tạo dữ liệu học tiếng Anh. Hãy giúp tôi tạo ra danh sách gồm 2 đến 5 chủ đề con dựa trên chủ đề lớn: "${topic}".

Bạn phải tự xác định và tạo ra đúng hai đối tượng giao tiếp dựa trên nội dung của chủ đề.  
Hai đối tượng phải là tên riêng hoặc vai trò cụ thể, ví dụ như Anna và Lily, Customer và Waiter, Patient và Doctor, Student và Teacher.

Yêu cầu bắt buộc:
1. Hai đối tượng được tạo ra phải phù hợp, tự nhiên và liên quan trực tiếp đến chủ đề: "${topic}".
   Bao gồm:
   - "participant_a"
   - "participant_b"

2. Mỗi sub-topic phải bao gồm:
   - "sub_topic_en": tên sub-topic bằng tiếng Anh 3 đến 8 từ
   - "sub_topic_vi": bản dịch tiếng Việt
   - "content_en": mô tả ngữ cảnh bằng tiếng Anh (10 đến 40 từ), nói rõ hai đối tượng đang ở đâu, hoàn cảnh gì, đang chuẩn bị làm gì
   - "content_vi": bản dịch tiếng Việt của ngữ cảnh
   - "description_en": mô tả mục đích sử dụng của tình huống (1 đến 3 câu)
   - "description_vi": bản dịch tiếng Việt
   - "task_a_en": nhiệm vụ dành riêng cho participant_a, phù hợp với vai trò
   - "task_a_vi": bản dịch tiếng Việt
   - "task_b_en": nhiệm vụ dành riêng cho participant_b, phù hợp với vai trò
   - "task_b_vi": bản dịch tiếng Việt

3. Sub-topic phải là tình huống giao tiếp thực tế giữa hai đối tượng, không trùng lặp nội dung.

4. "description" phải giải thích rõ **khi nào sử dụng** tình huống và **vì sao cần dùng**.

5. Không dùng ký tự đặc biệt như @, #, $, %, ^, &, *, (, ), -, +, =.

6. Trả về kết quả dưới dạng JSON thuần như sau:

[
  {
    "id": "1",
    "participant_a": "",
    "participant_b": "",
    "sub_topic_en": "",
    "sub_topic_vi": "",
    "content_en": "",
    "content_vi": "",
    "description_en": "",
    "description_vi": "",
    "task_a_en": "",
    "task_a_vi": "",
    "task_b_en": "",
    "task_b_vi": ""
  }
]

Không giải thích thêm. Không thêm text ngoài JSON. Không xuống dòng thừa.
`;
