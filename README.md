<div align="center">

# 🌟 Chào mừng bạn đến với dự án

## 📚 Social Learning

### Nền tảng Mạng xã hội hỗ trợ học tập Tiếng Anh và Giao tiếp Đa phương tiện

![Banner Dự Án](image/Banner.png)
[https://www.socialonlinelearning.tech/][1]

</div>

---

<div align="center">

##### 💬 "Học không chỉ đến từ sách vở, mà còn đến từ cộng đồng, nhóm và xã hội."

[![React Native](https://img.shields.io/badge/React_Native-v0.8-blue.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-v16-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 GIỚI THIỆU

**Social Learning** là một hệ sinh thái học tập toàn diện kết hợp giữa mạng xã hội và các công cụ rèn luyện tiếng Anh (Nghe, Nói, Viết). Dự án giải quyết vấn đề thiếu tính tương tác và môi trường giao tiếp thực tế trong các ứng dụng học tập hiện nay bằng cách tích hợp **Trí tuệ nhân tạo (AI)** và **Giao tiếp thời gian thực (Real-time Communication)**.

**Mục tiêu:** Tạo ra một cộng đồng năng động nơi người học không chỉ tiếp thu kiến thức cá nhân hóa mà còn có thể kết nối, chia sẻ và luyện tập trực tiếp với nhau.

---

## ✨ TÍNH NĂNG NỔI BẬT

### 🎓 Học tập thông minh (AI Integration)

- **Luyện Viết (Writing):** AI (Gemini) tự động tạo đề bài, chấm điểm ngữ pháp, từ vựng và gợi ý sửa lỗi chi tiết.
- **Luyện Nói (Speaking):**
  - **Roleplay AI:** Hội thoại theo ngữ cảnh (du lịch, công sở...) với phản hồi tức thì.
  - **Free Talk:** Trò chuyện tự do với AI để tăng phản xạ.
  - **Pronunciation:** Đánh giá phát âm qua Google Cloud Speech-to-Text.
- **Luyện Nghe (Listening):** Bài tập điền từ (Gap-fill) được tạo tự động.
- **Từ vựng (Vocabulary):** Học theo Flashcard và phương pháp Lặp lại ngắt quãng (Spaced Repetition).

### 🌏 Mạng xã hội & Giao tiếp (Social & Real-time)

- **Newsfeed:** Đăng bài (Text, Ảnh, Video), Like, Comment, Share.
- **Kết nối:** Kết bạn, Theo dõi (Follow), Gợi ý bạn bè phù hợp.
- **Chat & Call:** Nhắn tin 1-1, Chat nhóm, Gọi thoại (Voice Call) và Gọi Video (Video Call) chất lượng cao.
- **Gamification:** Bảng xếp hạng (Leaderboard), Chuỗi ngày học (Streak), Hệ thống tiền tệ ảo (Snowflake).

---

## 🛠 CÔNG NGHỆ SỬ DỤNG

Dự án được xây dựng trên kiến trúc **Client-Server** với các công nghệ tiên tiến:

### Frontend

- **Mobile:** React Native, NativeWind (TailwindCSS).
- **Web:** Next.js, ReactJS, TailwindCSS.

### Backend

- **Core:** Node.js, Express.js.
- **AI Service:** Google Gemini API, Google Cloud Speech-to-Text.
- **Real-time:** Socket.IO (Chat/Notification), ZegoCloud SDK (Video/Voice Call), Supabase Realtime.
- **Storage:** Cloudinary (Lưu trữ ảnh/video tin nhắn), Supabase Storage (Lưu trữ ảnh/video).

### Database

- **SQL:** Supabase (PostgreSQL) - Quản lý dữ liệu người dùng, bài học, thông báo, lịch sử hoạt động ....
- **NoSQL:** MongoDB - Quản lý tin nhắn.

### Infrastructure & Deployment

- **Server:** Digital Ocean (Droplets).
- **Payment:** Sepay (Cổng thanh toán QR Code).

---

## 📐 SƠ ĐỒ THIẾT KẾ

### 1. Sơ đồ Use Case

Tổng quan các chức năng của Người dùng và Admin.

<div align="center">
  <img src="/image/usecase.png" alt="Sơ đồ Use Case Tổng Quát" width="800"/>
  <br>
  <i>(Mô hình Use-case tổng quát)</i>
</div>

### 2. Sơ đồ Database (ERD)

#### SQL (Supabase) - Quản lý Social & Learning

<div align="center">
  <img src="/image/sqlSocial.jpg" alt="Database SQL Social" width="38%"/>
  <img src="/image/sql.jpg" alt="Database SQL Learning" width="45%"/>
</div>

#### NoSQL (MongoDB) - Quản lý Chat & Realtime

<div align="center">
  <img src="/image/nosql.jpg" alt="Database NoSQL" width="600"/>
</div>

### 3. Kiến trúc Phần mềm

<div align="center">
  <img src="/image/system_tech.jpg" alt="Sơ đồ triển khai" width="800"/>
  
  <p>(Sơ đồ triển khai phần mềm)</p>
</div>

Mô hình kết nối giữa Client, Server, Database và các dịch vụ bên thứ 3 (AI, Payment, Storage).

<div align="center">
  <img src="/image/system.png" alt="Kiến trúc phần mềm" width="800"/>
  
  <p>(Sơ đồ kiến trúc phần mềm)</p>
</div>

---

## 📸 HIỆN THỰC GIAO DIỆN

|             Trang chủ & Newsfeed             |              Giao diện Nhắn tin              |
| :------------------------------------------: | :------------------------------------------: |
| <img src="/image/newsfeed.png" width="400"/> | <img src="/image/messages.png" width="400"/> |
|         _Giao diện người dùng chính_         |              _Chat & Gọi Video_              |

|                 Luyện Viết                  |                  Luyện Nghe                   |
| :-----------------------------------------: | :-------------------------------------------: |
| <img src="/image/writing.png" width="400"/> | <img src="/image/listening.png" width="400"/> |
|           _AI chấm điểm và gợi ý_           |          _Nghe và điền vào ô trống_           |

|              Luyện Nói Cá Nhân               |                 Luyện Nói (Roleplay)                  |
| :------------------------------------------: | :---------------------------------------------------: |
| <img src="/image/speaking.png" width="400"/> | <img src="/image/speaking_realtime.png" width="400"/> |
|            _Luyện nói 10 câu mẫu_            |             _Hội thoại trực tiếp với AI_              |

|              Từ Vựng Cá Nhân              |            Tiến Trình Hoạt Động             |
| :---------------------------------------: | :-----------------------------------------: |
| <img src="/image/vocab.png" width="400"/> | <img src="/image/process.png" width="400"/> |
|         _Bộ từ vựng mỗi cá nhân_          |       _Lịch sử hoạt động và thống kê_       |

|             Lộ Trình Học Tập             |                   Admin                   |
| :--------------------------------------: | :---------------------------------------: |
| <img src="/image/path.png" width="400"/> | <img src="/image/admin.png" width="400"/> |
|        _Lộ trình của mỗi cá nhân_        |        _Quản lí tất cả thông tin_         |

---

## 🔗 LIÊN KẾT

- **Website:** [https://www.socialonlinelearning.tech/][1]
- **Mobile App:** [Download APK](...)
- **Demo Video:** [Youtube Link](...)

[1]: https://www.socialonlinelearning.tech/

---

## 🧑‍💻 ĐỘI NGŨ PHÁT TRIỂN

Dự án được thực hiện bởi nhóm sinh viên trường Đại học Công nghiệp TP.HCM (IUH).

### 🤝 Thành Viên

| **Họ và Tên**                            | **Vai Trò Chính** | **Trách Nhiệm Cụ Thể**                                                                               |
| :--------------------------------------- | :---------------- | :--------------------------------------------------------------------------------------------------- |
| **Nguyễn Thanh Thuận** <br> _(21080071)_ | Fullstack         | Quản lý dự án, thiết kế hệ thống, phát triển Frontend - Backend, tích hợp Gemini AI & Deploy.        |
| **Trương Quốc Bảo** <br> _(21017351)_    | Fullstack         | Quản lý dự án, thiết kế hệ thống, phát triển Frontend - Backend, tích hợp Gemini AI, thiết kế UI/UX. |

### 👩‍🏫 Giảng Viên Hướng Dẫn

- **ThS. Nguyễn Thị Hoàng Khánh**

---

## 📜 GIẤY PHÉP

Dự án được phát hành dưới **MIT License**. Xem chi tiết trong file `LICENSE`.

## 📬 LIÊN HỆ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng liên hệ qua:

- **Email:** ntthuan.dev@gmail.com
- **GitHub Issues:** [Mở issue tại đây](https://github.com/MrNguyen202/.../issues)

<div align="center">
  <sub>Được xây dựng với ❤️ và ☕ bởi Team Social Learning</sub>
</div>
