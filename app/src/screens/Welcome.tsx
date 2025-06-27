import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PenTool, Star } from 'lucide-react-native';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Computer Science Student',
    content:
      'This platform transformed how I learn. The study groups and peer discussions made complex topics so much easier to understand!',
    avatar: 'https://via.placeholder.com/40',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Professional Developer',
    content:
      "The collaborative approach to learning is incredible. I've made lasting connections while advancing my skills.",
    avatar: 'https://via.placeholder.com/40',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Specialist',
    content:
      'Finally, a learning platform that feels social and engaging. The community support is amazing!',
    avatar: 'https://via.placeholder.com/40',
    rating: 5,
  },
];

const Welcome = () => {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FDF2F8']} // orange-50 to pink-50
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#F97316', '#EC4899']} // orange-500 to pink-500
              style={styles.logo}
            >
              <PenTool size={20} color="#fff" />
            </LinearGradient>
            <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
              <Text style={styles.logoText}>SocialLearning</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.outlineButtonText}>Đăng Nhập</Text>
            </TouchableOpacity>
            <LinearGradient
              colors={['#F97316', '#EC4899']} // orange-500 to pink-500
              style={styles.gradientButton}
            >
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.gradientButtonText}>Đăng Ký</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nền tảng Học tập Xã hội</Text>
          </View>
          <Text style={styles.heroTitle}>
            Cộng đồng mạng xã hội{' '}
            <Text style={styles.heroHighlight}>Học tiếng Anh</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Tham gia cộng đồng nơi việc học tiếng Anh trở nên thú vị và tương
            tác. Viết lại câu, nhận phản hồi tức thì, kiếm điểm và leo lên bảng
            xếp hạng, đồng thời kết nối với những người học từ khắp nơi trên thế
            giới.
          </Text>
          <View style={styles.heroButtons}>
            <LinearGradient
              colors={['#F97316', '#EC4899']} // orange-500 to pink-500
              style={styles.gradientButtonLarge}
            >
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.gradientButtonText}>Tham gia ngay</Text>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity style={styles.outlineButtonLarge}>
              <Text style={styles.outlineButtonText}>Học thử</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>Cách hoạt động</Text>
        </View>

        {/* CTA Section */}
        <LinearGradient colors={['#F97316', '#EC4899']} style={styles.cta}>
          <Text style={styles.ctaTitle}>
            Sẵn sàng bắt đầu hành trình tiếng Anh của bạn?
          </Text>
          <Text style={styles.ctaDescription}>
            Tham gia cùng hàng ngàn người học đang cải thiện kỹ năng viết tiếng
            Anh mỗi ngày
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.ctaButtonText}>Tạo tài khoản miễn phí</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Testimonials */}
        <View style={styles.testimonials}>
          <Text style={styles.sectionTitle}>Bảng xếp hạng</Text>
          <Text style={styles.sectionSubtitle}>
            Những thành viên có thành tích cao nhất
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 SocialLearning. Bảo lưu mọi quyền.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  badge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    color: '#F97316',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroHighlight: {
    color: '#F97316', // Không hỗ trợ bg-clip-text, dùng màu trực tiếp
  },
  heroDescription: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  gradientButtonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  outlineButtonLarge: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#F9FAFBCC', // white/80
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  howItWorks: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  step: {
    alignItems: 'center',
    width: '22%',
    minWidth: 150,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  cta: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  testimonials: {
    marginBottom: 32,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  testimonialCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialContent: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  authorRole: {
    fontSize: 12,
    color: '#4B5563',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default Welcome;
