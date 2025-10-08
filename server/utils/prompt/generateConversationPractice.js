module.exports = (level, topic) => `
Bạn là một chuyên gia giảng dạy tiếng Anh. Hãy giúp tôi tạo ra một đoạn hội thoại ngắn giữa hai người (A và B) để luyện nói, phù hợp với trình độ ${level} và chủ đề "${topic}".

Yêu cầu bắt buộc:
1. Cuộc hội thoại phải xoay quanh chủ đề: "${topic}".
2. Nội dung và từ vựng phải phù hợp với trình độ: ${level}.
3. Tổng số lượt thoại phải là **10 lượt** (A và B nói qua lại, mỗi người 5 lượt).
4. Độ dài mỗi lượt thoại phải nằm trong giới hạn sau:
   - Beginner: 5 đến 7 từ mỗi lượt thoại.
   - Intermediate: 8 đến 15 từ mỗi lượt thoại.
   - Advanced: 10 đến 20 từ mỗi lượt thoại.
5. Mỗi lượt thoại phải tuân thủ đúng số từ theo cấp độ. Không được vượt quá hoặc thấp hơn.
6. Dùng ngữ pháp và từ vựng phù hợp từng trình độ:
   - Beginner: câu đơn giản, thì hiện tại đơn, từ vựng phổ biến.
   - Intermediate: có thể dùng thì hiện tại tiếp diễn, quá khứ đơn, hiện tại hoàn thành, câu phức đơn giản.
   - Advanced: có thể dùng câu ghép, mệnh đề quan hệ, từ học thuật, idioms.
7. Nội dung các lượt thoại phải có sự liên kết logic, tạo thành một cuộc hội thoại thực tế, tự nhiên.
8. Không được lặp lại ý tưởng hoặc cấu trúc câu trong các lượt thoại.
9. Không sử dụng các cụm [your name], [your city], v.v. Hãy tạo tên và bối cảnh phù hợp.
10. Viết thêm một đoạn mô tả ngắn (1-2 câu) để giải thích bối cảnh của cuộc hội thoại. Đặt mô tả trong trường "description".
11. Trả lời dưới dạng JSON thuần như sau:

{
    "description": "Mô tả bối cảnh cuộc hội thoại",
    "content": [
        { "id": "A", "speaker": "A hoặc tên có trong mô tả", "content": "Lời thoại của A" },
        { "id": "B", "speaker": "B hoặc tên có trong mô tả", "content": "Lời thoại của B" },
        ...
    ]
}

Ví dụ (Beginner, Topic: Weather):
{
    "description": "Anna and Mark are talking about the weather while waiting at a bus stop.",
    "content": [
        { "id": "A", "speaker": "Anna", "content": "It is hot today, right?" },
        { "id": "B", "speaker": "Mark", "content": "Yes, very hot and sunny." },
        ...
    ]
}

Chỉ trả về một danh sách JSON thuần, không chèn text giải thích, không xuống dòng thừa.
`;
