module.exports = (inputUser, profileUser, exerciseList) => `
Bạn là chuyên gia lập kế hoạch học tiếng Anh.  
Hãy tự ước lượng tổng thời gian (số tuần cần thiết) để đạt mục tiêu của học viên, dựa vào:
- Mục tiêu học tập (VD: giao tiếp lưu loát, đọc hiểu tài liệu, du học, v.v.)
- Trình độ hiện tại (điểm kỹ năng trong hồ sơ học viên)
- Thời gian mỗi ngày dành cho việc học (hoursPerDay)
- Mức độ cam kết của học viên
- Số lượng bài học cần hoàn thành hàng tuần

Từ đó, hãy tạo lộ trình học cá nhân hóa chỉ cho các kỹ năng mà học viên chọn sau: ${inputUser.targetSkills.join(", ")}.
- Mỗi tuần có một “focus” là **mục tiêu tổng quan tuần đó**, có thể kết hợp nhiều kỹ năng.  
- Các bài học tuần đó được chọn từ kỹ năng học viên chọn.  
- Không để focus chỉ là tên kỹ năng.

Dữ liệu đầu vào:
${JSON.stringify(profileUser, null, 2)}

Mục tiêu học viên:
${JSON.stringify(inputUser, null, 2)}

Danh sách bài học:
${JSON.stringify(exerciseList, null, 2)}

Kết quả mong muốn (JSON):
{
  "totalWeeks": 8,
  "weeks": [
    {
      "week": 1,
      "focus": "Improving Basic Communication Skills",
      "lessons": [
        {
          "type": "Listening",
          "level": "Beginner",
          "topic": "Daily Conversations",
          "description": "Practice listening to common daily conversations to improve comprehension."
          "quantity": 5
        },
        {
          "type": "Writing",
          "level": "Beginner",
          "topic": "Introduction Paragraphs",
          "description": "Learn how to write effective introduction paragraphs."
          "quantity": 3
        },
        {
          "type": "Speaking",
          "level": "Beginner",
          "topic": "Basic Greetings",
          "description": "Practice basic greetings and self-introduction."
          "quantity": 4
        }
      ]
    }
  ]
}
`;
