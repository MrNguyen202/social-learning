import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
    ArrowLeft,
    Mic,
    NotebookText,
    Headphones,
    ChevronDown,
    ChevronUp,
    Sparkles,
    BookOpen as BookOpenIcon,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRoadmapAndLessonsById } from '../../../api/learning/roadmap/route';
import { getLevelsByNameVi, getTopicsByNameVi } from '../../../api/learning/route';
import { listeningService } from '../../../api/learning/listening/route';

type Lesson = {
    type: string;
    level: string;
    topic: string;
    description_vi: string;
    quantity: number;
    completedCount: number;
    typeParagraph?: string;
    isCompleted?: boolean;
    level_vi?: string;
    topic_vi?: string;
};

type Week = {
    week: number;
    focus_vi: string;
    lessons: Lesson[];
};

type Roadmap = {
    totalWeeks: number;
    weeks: Week[];
};

const iconMap: Record<string, any> = {
    Speaking: Mic,
    Writing: NotebookText,
    Listening: Headphones,
};

const iconColorMap: Record<string, string> = {
    Speaking: '#10b981',
    Writing: '#3b82f6',
    Listening: '#f59e0b',
};

const RoadmapDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { pathId } = route.params as { pathId: string };

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        const fetchRoadmap = async () => {
            setLoading(true);
            try {
                const response = await getRoadmapAndLessonsById(pathId);
                setRoadmap(response);
            } catch (err) {
                console.error('Lỗi khi fetch roadmap:', err);
                Alert.alert(
                    'Lỗi',
                    'Không thể tải chi tiết lộ trình. Vui lòng thử lại sau.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } finally {
                setLoading(false);
            }
        };

        if (pathId) {
            fetchRoadmap();
        }
    }, [pathId]);

    const toggleWeek = (week: number) => {
        setExpandedWeeks((prev) =>
            prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
        );
    };

    const handleGenerateAI = async (lesson: Lesson) => {
        setPageLoading(true);
        try {
            const resLevels = await getLevelsByNameVi(lesson.level);
            const resTopics = await getTopicsByNameVi(lesson.topic);

            if (lesson.type === 'Listening') {
                const response = await listeningService.generateListeningExerciseByAI(
                    resLevels[0].slug,
                    resTopics[0].slug
                );

                if (response && response.data && response.data.id) {
                    const listeningExerciseId = response.data.id;
                    navigation.navigate('ListeningDetail', { exerciseId: listeningExerciseId });
                } else {
                    Alert.alert('Lỗi', 'Không thể tạo bài tập từ AI');
                }
            } else if (lesson.type === 'Speaking') {
                navigation.navigate('SpeakingLessonAI', {
                    levelId: resLevels[0].id,
                    topicId: resTopics[0].id,
                    levelSlug: resLevels[0].slug,
                    topicSlug: resTopics[0].slug,
                });
            }
        } catch (error) {
            console.error('Error generating AI lesson:', error);
            Alert.alert('Lỗi', 'Không thể tạo bài tập AI. Vui lòng thử lại.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSystemExercise = async (lesson: Lesson) => {
        try {
            const resLevels = await getLevelsByNameVi(lesson.level);
            const resTopics = await getTopicsByNameVi(lesson.topic);

            if (lesson.type === 'Listening') {
                navigation.navigate('ListExercise', {
                    level: resLevels[0].slug,
                    topic: resTopics[0].slug,
                });
            } else if (lesson.type === 'Speaking') {
                navigation.navigate('SpeakingLesson', {
                    levelId: resLevels[0].id,
                    topicId: resTopics[0].id,
                    levelSlug: resLevels[0].slug,
                    topicSlug: resTopics[0].slug,
                });
            }
        } catch (error) {
            console.error('Error navigating to system exercise:', error);
            Alert.alert('Lỗi', 'Không thể mở bài tập. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loadingText}>Đang tải lộ trình...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!roadmap) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không tìm thấy lộ trình</Text>
                    <TouchableOpacity
                        style={styles.backButtonError}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonErrorText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>🌱 Lộ trình học</Text>
                        <Text style={styles.headerSubtitle}>{roadmap.totalWeeks} tuần</Text>
                    </View>

                    <View style={styles.headerRight} />
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.contentArea}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {roadmap.weeks.map((week) => {
                        const isExpanded = expandedWeeks.includes(week.week);
                        const Icon = isExpanded ? ChevronUp : ChevronDown;

                        return (
                            <View key={week.week} style={styles.weekContainer}>
                                {/* Week Header */}
                                <TouchableOpacity
                                    style={styles.weekHeader}
                                    onPress={() => toggleWeek(week.week)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.weekNumber}>
                                        <LinearGradient
                                            colors={['#10b981', '#059669']}
                                            style={styles.weekNumberGradient}
                                        >
                                            <Text style={styles.weekNumberText}>{week.week}</Text>
                                        </LinearGradient>
                                    </View>

                                    <View style={styles.weekInfo}>
                                        <Text style={styles.weekTitle}>Tuần {week.week}</Text>
                                        <Text style={styles.weekFocus}>{week.focus_vi}</Text>
                                    </View>

                                    <View style={styles.expandIcon}>
                                        <Icon size={24} color="#10b981" />
                                    </View>
                                </TouchableOpacity>

                                {/* Week Lessons */}
                                {isExpanded && (
                                    <View style={styles.lessonsContainer}>
                                        {week.lessons.map((lesson, idx) => {
                                            const progress =
                                                lesson.quantity > 0
                                                    ? (lesson.completedCount / lesson.quantity) * 100
                                                    : 0;
                                            const percent = Math.round(progress);
                                            const LessonIcon = iconMap[lesson.type];
                                            const iconColor = iconColorMap[lesson.type];

                                            return (
                                                <View key={idx} className='bg-slate-100' style={[styles.lessonCard]}>
                                                    {/* Lesson Header */}
                                                    <View style={styles.lessonHeader}>
                                                        <View style={styles.lessonTitleRow}>
                                                            {LessonIcon && (
                                                                <LessonIcon size={20} color={iconColor} />
                                                            )}
                                                            <View style={styles.lessonTitleContainer}>
                                                                <Text style={styles.lessonType}>
                                                                    {lesson.type}{' '}
                                                                    <Text style={styles.lessonLevel}>
                                                                        ({lesson.level_vi})
                                                                    </Text>
                                                                </Text>
                                                                <Text style={styles.lessonTopic}>
                                                                    {lesson.topic}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={styles.lessonBadge}>
                                                            <Text style={styles.lessonBadgeText}>
                                                                {lesson.quantity} bài
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Description */}
                                                    <Text style={styles.lessonDescription}>
                                                        {lesson.description_vi}
                                                    </Text>

                                                    {/* Progress */}
                                                    <View style={styles.progressContainer}>
                                                        <View style={styles.progressBarBg}>
                                                            <LinearGradient
                                                                colors={
                                                                    percent < 50
                                                                        ? ['#ef4444', '#f59e0b']
                                                                        : ['#10b981', '#059669']
                                                                }
                                                                start={{ x: 0, y: 0 }}
                                                                end={{ x: 1, y: 0 }}
                                                                style={[
                                                                    styles.progressBarFill,
                                                                    { width: `${percent}%` },
                                                                ]}
                                                            />
                                                        </View>
                                                        <Text style={styles.progressText}>
                                                            {lesson.completedCount}/{lesson.quantity} • {percent}%
                                                        </Text>
                                                    </View>

                                                    {/* Action Buttons */}
                                                    <View className='flex flex-row justify-between items-center'>
                                                        <LinearGradient
                                                            colors={['#f97316', '#ec4899']}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{borderRadius: 24, width: '48%'}}
                                                            className='items-center'
                                                        >
                                                            <TouchableOpacity
                                                                onPress={() => handleGenerateAI(lesson)}
                                                                activeOpacity={0.8}
                                                                className='flex-row items-center px-4 py-2 gap-2'
                                                            >
                                                                {/* <Sparkles size={16} color="#fff" /> */}
                                                                <Text className='text-white'>
                                                                    Tạo bài tập AI
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </LinearGradient>

                                                        <LinearGradient
                                                            colors={['#3b82f6', '#60a5fa']}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{borderRadius: 24 , width: '48%'}}
                                                            className='items-center'
                                                        >
                                                            <TouchableOpacity
                                                                className='flex-row items-center px-4 py-2 gap-2'
                                                                onPress={() => handleSystemExercise(lesson)}
                                                                activeOpacity={0.8}
                                                            >
                                                                {/* <BookOpenIcon size={16} color="#fff" /> */}
                                                                <Text className='text-white text-center'>
                                                                    Bài tập hệ thống
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Loading Overlay */}
            {pageLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingModal}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingModalText}>
                            Đang tạo đoạn văn bằng AI...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fdf4',
    },
    headerGradient: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        marginTop: 2,
    },
    headerRight: {
        width: 40,
    },
    contentArea: {
        flex: 1,
        backgroundColor: '#f0fdf4',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -16,
        overflow: 'hidden',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 20,
    },
    backButtonError: {
        backgroundColor: '#10b981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonErrorText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    weekContainer: {
        marginBottom: 16,
    },
    weekHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    weekNumber: {
        marginRight: 12,
    },
    weekNumberGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekNumberText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    weekInfo: {
        flex: 1,
    },
    weekTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    weekFocus: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    expandIcon: {
        marginLeft: 8,
    },
    lessonsContainer: {
        marginTop: 12,
        gap: 12,
    },
    lessonCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    lessonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    lessonTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 8,
    },
    lessonTitleContainer: {
        flex: 1,
    },
    lessonType: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    lessonLevel: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: 'normal',
    },
    lessonTopic: {
        fontSize: 14,
        color: '#4b5563',
        marginTop: 2,
        fontWeight: '600',
    },
    lessonBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    lessonBadgeText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    lessonDescription: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '600',
        minWidth: 70,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    aiButton: {
        backgroundColor: '#f97316',
    },
    systemButton: {
        backgroundColor: '#3b82f6',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingModal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        minWidth: 200,
    },
    loadingModalText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '600',
    },
});

export default RoadmapDetailScreen;