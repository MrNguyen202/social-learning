import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PenTool, Users, Trophy, Target, BookOpen, Star, Bot } from "lucide-react";
import Link from "next/link";

export default function Page() {

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content:
        "This platform transformed how I learn. The study groups and peer discussions made complex topics so much easier to understand!",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Professional Developer",
      content:
        "The collaborative approach to learning is incredible. I've made lasting connections while advancing my skills.",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Specialist",
      content: "Finally, a learning platform that feels social and engaging. The community support is amazing!",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              <Link href="/">SocialLearning</Link>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              asChild
            >
              <Link href="/auth/login">Đăng Nhập</Link>
            </Button>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              asChild
            >
              <Link href="/auth/register">Đăng kí</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-6 bg-orange-100 text-orange-800 hover:bg-orange-100">
            Nền tảng Học tập Xã hội
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Cộng đồng mạng xã hội
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {" "}
              Học tiếng Anh
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tham gia cộng đồng nơi việc học tiếng Anh trở nên thú vị và tương
            tác. Viết lại câu, nhận phản hồi tức thì, kiếm điểm và leo lên bảng
            xếp hạng, đồng thời kết nối với những người học từ khắp nơi trên thế
            giới.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
            >
              <Link href="auth/login">Tham gia ngay</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg"
            >
              Học thử
            </Button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Luyện viết câu thông minh
              </h3>
              <p className="text-gray-600">
                Viết lại câu với phản hồi được hỗ trợ bởi AI. Nhận sửa lỗi tức
                thì và cải thiện kỹ năng viết tiếng Anh của bạn qua mỗi lần thử.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Học tập qua tương tác xã hội
              </h3>
              <p className="text-gray-600">
                Kết nối với những người học khác, chia sẻ tiến độ của bạn và học
                hỏi lẫn nhau trong một môi trường xã hội lấy cảm hứng từ
                Instagram.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tính điểm & Xếp hạng
              </h3>
              <p className="text-gray-600">
                Kiếm điểm cho các bài viết lại chính xác, thi đấu với bạn bè và
                leo lên bảng xếp hạng toàn cầu để thể hiện kỹ năng tiếng Anh của
                bạn.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Hỗ trợ
              </h3>
              <p className="text-gray-600">
                Chatbot AI hỗ trợ mọi thắc mắc của bạn, cung cấp giải thích và
                hướng dẫn để giúp bạn hiểu rõ hơn về ngữ pháp và cấu trúc câu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cách hoạt động */}
        <div className="max-w-4xl mx-auto text-center mb-16 ">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Cách hoạt động
          </h2>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Nhận câu</h3>
              <p className="text-sm text-gray-600">
                Nhận một câu để viết lại và cải thiện
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <PenTool className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Viết lại</h3>
              <p className="text-sm text-gray-600">
                Sử dụng kỹ năng tiếng Anh của bạn để cải thiện câu
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Nhận phản hồi
              </h3>
              <p className="text-sm text-gray-600">
                Nhận sửa lỗi và giải thích tức thì
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Kiếm điểm</h3>
              <p className="text-sm text-gray-600">
                Kiếm điểm và leo lên bảng xếp hạng
              </p>
            </div>
          </div>
        </div>

        {/* Bắt đầu */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Bắt đầu hành trình tiếng Anh của bạn?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Tham gia cùng hàng ngàn người học đang cải thiện kỹ năng viết tiếng
            Anh mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              <Link href="auth/register">Tạo tài khoản miễn phí</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Rank */}
      <section id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Bảng xếp hạng</h2>
            <p className="text-xl text-gray-600">Những thành viên có thành tích cao nhất</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg transition-transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 SocialLearning. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
}
