import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { styles } from '../styles/LandingStyles';
import { ArrowRight, BookOpen, Play, Star } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const features = [
    {
      icon: 'users',
      title: 'Collaborative Learning',
      description:
        'Connect with peers, form study groups, and learn together in an interactive environment.',
    },
    {
      icon: 'message-circle',
      title: 'Discussion Forums',
      description:
        'Engage in meaningful discussions, ask questions, and share knowledge with the community.',
    },
    {
      icon: 'award',
      title: 'Achievement System',
      description:
        'Track your progress, earn badges, and celebrate milestones with gamified learning.',
    },
    {
      icon: 'book-open',
      title: 'Rich Content Library',
      description:
        'Access thousands of courses, tutorials, and resources curated by experts.',
    },
    {
      icon: 'globe',
      title: 'Global Community',
      description:
        'Learn from diverse perspectives and connect with learners worldwide.',
    },
    {
      icon: 'zap',
      title: 'Personalized Learning',
      description:
        'AI-powered recommendations tailored to your learning style and goals.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      content:
        'This platform transformed how I learn. The study groups and peer discussions made complex topics so much easier to understand!',
      avatar: 'https://placeholder.svg/40x40',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Professional Developer',
      content:
        "The collaborative approach to learning is incredible. I've made lasting connections while advancing my skills.",
      avatar: 'https://placeholder.svg/40x40',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Specialist',
      content:
        'Finally, a learning platform that feels social and engaging. The community support is amazing!',
      avatar: 'https://placeholder.svg/40x40',
      rating: 5,
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Learners' },
    { number: '1000+', label: 'Courses Available' },
    { number: '25K+', label: 'Study Groups' },
    { number: '95%', label: 'Success Rate' },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} size={14} color="#FCD34D" style={{ marginRight: 2 }} />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logo}>
              {/* <LinearGradient colors={["#2563EB", "#7C3AED"]} style={styles.logoGradient}> */}
              <BookOpen size={20} color="white" />
              {/* </LinearGradient> */}
              <Text style={styles.logoText}>LearnTogether</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                {/* <LinearGradient colors={["#2563EB", "#7C3AED"]} style={styles.getStartedButton}> */}
                <Text style={styles.getStartedButtonText}>Get Started</Text>
                {/* </LinearGradient> */}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#EFF6FF', '#FFFFFF', '#FAF5FF']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                🚀 Join 50,000+ learners worldwide
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              Learn Better{' '}
              <Text style={styles.heroTitleGradient}>Together</Text>
            </Text>

            <Text style={styles.heroDescription}>
              Connect with peers, join study groups, and accelerate your
              learning through collaborative education. Experience the power of
              social learning.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <LinearGradient
                  colors={['#2563EB', '#7C3AED']}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    Start Learning Free
                  </Text>
                  <ArrowRight
                    size={16}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Play size={16} color="#374151" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Study Group Preview */}
            <View style={styles.studyGroupPreview}>
              <View style={styles.studyGroupHeader}>
                <View style={styles.studyGroupInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>JD</Text>
                  </View>
                  <View>
                    <Text style={styles.studyGroupTitle}>
                      John's Study Group
                    </Text>
                    <Text style={styles.studyGroupSubtitle}>
                      React Development • 12 members
                    </Text>
                  </View>
                </View>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>Live</Text>
                </View>
              </View>

              <View style={styles.chatMessages}>
                <View style={styles.messageRow}>
                  <View style={[styles.avatar, styles.smallAvatar]}>
                    <Text style={styles.smallAvatarText}>SA</Text>
                  </View>
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>
                      Can someone explain React hooks?
                    </Text>
                  </View>
                </View>
                <View style={styles.messageRow}>
                  <View style={[styles.avatar, styles.smallAvatar]}>
                    <Text style={styles.smallAvatarText}>MK</Text>
                  </View>
                  <View
                    style={[styles.messageBubble, styles.messageBubbleBlue]}
                  >
                    <Text style={styles.messageText}>
                      Hooks let you use state in functional components...
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.studyGroupFooter}>
                <View style={styles.avatarStack}>
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.avatar, styles.stackedAvatar]}>
                      <Text style={styles.smallAvatarText}>U{i}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.footerText}>+8 more learning together</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Why Choose Social Learning?</Text>
            <Text style={styles.sectionDescription}>
              Experience the power of collaborative education with features
              designed to enhance your learning journey.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <LinearGradient
                  colors={['#2563EB', '#7C3AED']}
                  style={styles.featureIcon}
                >
                  <Text>{feature.icon}</Text>
                </LinearGradient>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <Text style={styles.sectionDescription}>
              Get started in three simple steps
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description:
                  'Sign up and tell us about your learning goals and interests.',
              },
              {
                step: '02',
                title: 'Join Study Groups',
                description:
                  'Find and join study groups that match your subjects and schedule.',
              },
              {
                step: '03',
                title: 'Learn Together',
                description:
                  'Collaborate, discuss, and achieve your learning goals with peers.',
              },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <LinearGradient
                  colors={['#2563EB', '#7C3AED']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </LinearGradient>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What Our Learners Say</Text>
            <Text style={styles.sectionDescription}>
              Join thousands of successful learners
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.testimonialsScroll}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.starsContainer}>
                  {renderStars(testimonial.rating)}
                </View>
                <Text style={styles.testimonialContent}>
                  "{testimonial.content}"
                </Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{testimonial.name}</Text>
                    <Text style={styles.authorRole}>{testimonial.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#2563EB', '#7C3AED']}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>Ready to Transform Your Learning?</Text>
          <Text style={styles.ctaDescription}>
            Join our community of learners and start your collaborative learning
            journey today.
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaPrimaryButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.ctaPrimaryButtonText}>Get Started Free</Text>
              <ArrowRight size={16} color="#2563EB" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondaryButton}>
              <Text style={styles.ctaSecondaryButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLogo}>
              <LinearGradient
                colors={['#2563EB', '#7C3AED']}
                style={styles.logoGradient}
              >
                <BookOpen size={20} color="white" />
              </LinearGradient>
              <Text style={styles.footerLogoText}>LearnTogether</Text>
            </View>
            <Text style={styles.footerDescription}>
              Empowering learners through collaborative education and social
              learning experiences.
            </Text>
            <Text style={styles.copyright}>
              © 2024 LearnTogether. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
