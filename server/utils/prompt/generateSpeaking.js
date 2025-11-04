module.exports = (level, topic) => `
Bạn là một chuyên gia ngôn ngữ tiếng Anh. Hãy giúp tôi tạo một danh sách 10 câu nói bằng tiếng Anh để luyện nói, phù hợp với trình độ ${level} và chủ đề "${topic}".

Yêu cầu bắt buộc:
1. Chủ đề của các câu nói phải liên quan đến: ${topic}.
2. Câu nói phải phù hợp với trình độ: ${level}.
3. Câu nói phải tuân theo đúng giới hạn từ như sau:
   - Beginner: mỗi câu chỉ từ 5 đến 7 từ.
   - Intermediate: mỗi câu từ 8 đến 15 từ.
   - Advanced: mỗi câu từ 10 đến 20 từ.
4. Không được viết quá số từ quy định. Phải tuân thủ chính xác.
5. Trả lời dưới dạng JSON thuần, dạng danh sách như sau:

[
    { "id": "1", "content": "Câu nói bằng tiếng Anh" },
    { "id": "2", "content": "Câu nói bằng tiếng Anh" },
    ...
    { "id": "10", "content": "Câu nói bằng tiếng Anh" }
]

Ví dụ:
Nếu level là "Beginner" và topic là "Travel":
[
    { "id": "1", "content": "I like to travel alone." },
    { "id": "2", "content": "We go by train every week." }
]

Nếu level là "Intermediate":
[
    { "id": "1", "content": "I usually travel with my family during summer vacations." },
    { "id": "2", "content": "My favorite destination is the mountains because it's peaceful." }
]

Nếu level là "Advanced":
[
    { "id": "1", "content": "Traveling to unfamiliar countries helps broaden my perspective and cultural understanding." },
    { "id": "2", "content": "I always research local customs and etiquette before visiting a foreign country." }
]

6. Mỗi câu bắt buộc phải có số từ nằm trong khoảng quy định theo từng trình độ. Không được ít hơn hoặc vượt quá giới hạn này.
7. Câu ở trình độ Beginner chỉ dùng từ vựng và ngữ pháp đơn giản (hiện tại đơn, danh từ, động từ cơ bản).
8. Câu ở trình độ Intermediate có thể dùng thì tiếp diễn, quá khứ đơn, hiện tại hoàn thành, hoặc câu phức đơn giản.
9. Câu ở trình độ Advanced được phép dùng câu ghép, câu phức, mệnh đề quan hệ, hoặc từ vựng học thuật.
10. Các câu nói phải mang ý tưởng khác nhau, tránh lặp lại cấu trúc hoặc nội dung quá giống nhau.
11. Không sử dụng [email], [your name], [your country], [your favorite place] hoặc các cụm từ tương tự mà hãy hãy tạo tên bất kì.
12. Không sử dụng kí tự đặc biệt như @, #, $, %, ^, &, *, (, ), -, +, =, v.v.
13. Nếu câu có số là thời gian ( ví dụ: 7 am, 12 pm, 7:00 am, 12:00 pm ...), hãy chuyển thành dạng 7:00, 12:00 ...
Chỉ trả về một danh sách JSON thuần, không giải thích, không chèn text, không xuống dòng thừa.
`;
