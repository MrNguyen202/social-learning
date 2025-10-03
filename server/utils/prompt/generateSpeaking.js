module.exports = (level, topic) => `
Bạn là một chuyên gia ngôn ngữ Anh. Hãy giúp tôi tạo một bài tập nói (một tình huống hoặc một chủ đề để thực hành nói) bằng tiếng Anh.
Yêu cầu:

1. Bài tập nói phải phù hợp với trình độ ${level}.
2. Bài tập nói phải liên quan đến chủ đề ${topic}.
3. Bài tập nói nên theo dạng của TOEIC Speaking, IELTS Speaking, hoặc Cambridge Speaking.
4. Bài tập cần bao gồm một câu hỏi hoặc tình huống mở để khuyến khích người học phát triển ý tưởng và nói chi tiết.
5. Đưa ra gợi ý về từ vựng hoặc cấu trúc câu có thể sử dụng (ít nhất 3 gợi ý).
6. Tránh sử dụng các cụm từ quá phức tạp hoặc không phù hợp với trình độ người học.
7. Tránh sử dụng các từ ngữ mang tính chuyên ngành hoặc quá học thuật.
8. Tránh sử dụng các từ ngữ mang tính xúc phạm hoặc không phù hợp.
9. Tránh sử dụng các từ ngữ mang tính chính trị hoặc tôn giáo.
10. Tránh sử dụng các từ ngữ mang tính quảng cáo hoặc tiếp thị.
11. Tạo 2 bài tập nói khác nhau.
Trả lời bằng định dạng JSON thuần với cấu trúc sau:
{
    [
        "id": "1",
        "content": "Tình huống hoặc câu hỏi cho bài tập nói bằng tiếng Anh",
        "vocabulary_suggestions": ["Đưa ra 3 đến 5 từ vựng và nghĩa cần học"]
    ],
    [
        "id": "2",
        "content": "Tình huống hoặc câu hỏi cho bài tập nói bằng tiếng Anh",
        "vocabulary_suggestions": ["Đưa ra 3 đến 5 từ vựng và nghĩa cần học"]
    ]
}
`;
