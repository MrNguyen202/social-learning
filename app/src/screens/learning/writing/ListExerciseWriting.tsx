import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, BookText, Filter } from 'lucide-react-native';

// --- API Client ---
import { getAllTopics, getLevelBySlug, getTypeParagraphBySlug } from '../../../api/learning/route';
import { getListWritingParagraphsByTypeLevelTypeParagraph } from '../../../api/learning/writing/route';

// --- Components ---
import CardWritingExercise from './components/CardExercise'; // Card bạn vừa cung cấp
import TopicFilterModal from './components/TopicFilterModal';

// --- Types ---
type PageParams = { type: string; level: string; typeParagraph: string; };
type PageRouteProp = RouteProp<{ params: PageParams }, 'params'>;

// Interface khớp với dữ liệu trả về từ API (giống bên Web page.tsx)
interface WritingExercise {
    id: string;
    title_vi: string;
    title_en: string;
    content_vi: string;
    label: string;
    submit_times: number;
    isCorrect?: boolean | null;
    topic_id: number;
    genAI?: any;
}

type Topic = {
    id: number;
    name_vi: string;
    slug: string;
};

const ITEMS_PER_PAGE = 10; // Load 10 bài mỗi lần cuộn

export default function ListExerciseWriting() {
    const navigation = useNavigation<any>();
    const route = useRoute<PageRouteProp>();
    const { type, level, typeParagraph } = route.params;

    // --- State ---
    const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);
    const [levelExerciseName, setLevelExerciseName] = useState<string>("");

    // Filter State
    const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<{ id: number; slug: string; name_vi: string }>({ id: 0, slug: 'all', name_vi: 'Tất cả chủ đề' });
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);      // Loading lần đầu / Reset
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // Loading khi cuộn thêm
    const [isRefreshing, setIsRefreshing] = useState(false);        // Kéo xuống để refresh

    // --- 1. Fetch Metadata (Chạy 1 lần để lấy tên Level và List Topic) ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [levelNameData, topicsData, typeParagraphData] = await Promise.all([
                    getLevelBySlug(level),
                    getAllTopics(),
                    getTypeParagraphBySlug(typeParagraph),
                ]);

                if (levelNameData) setLevelExerciseName(levelNameData.name_vi);

                // Nếu user vào từ 1 topic cụ thể
                if (typeParagraphData && typeParagraph !== 'all') {
                    setSelectedTopic({
                        id: typeParagraphData.id,
                        slug: typeParagraphData.slug,
                        name_vi: typeParagraphData.name_vi
                    });
                }

                if (Array.isArray(topicsData)) {
                    setTopicFilters(topicsData);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };
        fetchMetadata();
    }, [level, typeParagraph]);

    // --- 2. Main Fetch Function (Logic Phân Trang) ---
    const fetchExercises = useCallback(async (page: number, topicSlug: string, isReset: boolean = false) => {
        try {
            if (isReset) setIsLoading(true);
            else setIsLoadingMore(true);

            const response = await getListWritingParagraphsByTypeLevelTypeParagraph(
                type,
                level,
                topicSlug,
                page,
                ITEMS_PER_PAGE
            );

            const resData: any = response;
            const newData = resData.data || [];
            const total = resData.totalPages || 1;

            setTotalPages(total);

            if (isReset) {
                setWritingExercises(newData);
            } else {
                // Nối dữ liệu mới vào dữ liệu cũ
                setWritingExercises(prev => [...prev, ...newData]);
            }

        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
        }
    }, [type, level]);

    // --- 3. Effect: Trigger Fetch khi Filter thay đổi ---
    useEffect(() => {
        // Reset về trang 1 mỗi khi đổi Topic
        setCurrentPage(1);
        fetchExercises(1, selectedTopic.slug, true);
    }, [selectedTopic.slug, fetchExercises]);

    // --- 4. Handlers ---

    // Xử lý Infinite Scroll (Load More)
    const handleLoadMore = () => {
        if (!isLoading && !isLoadingMore && currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchExercises(nextPage, selectedTopic.slug, false);
        }
    };

    // Xử lý Pull-to-Refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        setCurrentPage(1);
        fetchExercises(1, selectedTopic.slug, true);
    };

    // Chọn Topic từ Modal
    const handleSelectTopic = (arg: { id: number; slug: string; name_vi: string } | 'all') => {
        if (arg === 'all') {
            setSelectedTopic({ id: 0, slug: 'all', name_vi: 'Tất cả chủ đề' });
        } else {
            setSelectedTopic({ id: arg.id, slug: arg.slug, name_vi: arg.name_vi });
        }
        setIsFilterModalVisible(false);
    };

    const handleStartWritingExercise = (exerciseId: string) => {
        navigation.navigate('WritingDetail', { id: exerciseId });
    };

    // --- 5. Renders ---

    const renderExerciseItem = ({ item }: { item: WritingExercise }) => {
        // Check nếu có object genAI thì là bài tập cá nhân, ngược lại là hệ thống
        const isUserGen = !!item.genAI;

        return (
            <CardWritingExercise
                title={item.title_vi || item.title_en}
                content_vi={item.content_vi}
                label={require('../../../../assets/images/title-writing.gif')}
                submitTimes={item.submit_times} // Truyền số lần nộp
                isUserGenerated={isUserGen}     // Truyền cờ xác định User/System
                isCorrect={item.isCorrect}
                handleStart={() => handleStartWritingExercise(item.id)}
            />
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return <View className="h-6" />;
        return (
            <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text className="text-gray-400 text-xs mt-2">Đang tải thêm...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View className="flex-1 items-center justify-center mt-20 px-10">
                <BookText size={64} color="#e5e7eb" />
                <Text className="mt-4 text-gray-500 text-lg text-center font-medium">
                    Không tìm thấy bài tập nào
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f9fafb]">
            {/* Header Gradient */}
            <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5 pb-6 rounded-b-[24px] shadow-sm"
            >
                <View className="flex flex-row items-center justify-between mt-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="items-center flex-1 mx-2">
                        <Text className="text-white text-lg font-bold text-center" numberOfLines={1}>
                            {levelExerciseName || "Bài tập viết"}
                        </Text>
                        <View className="bg-black/10 px-3 py-0.5 rounded-full mt-1">
                            <Text className="text-white text-xs opacity-90">
                                {selectedTopic.slug === 'all' ? 'Tất cả chủ đề' : selectedTopic.name_vi}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsFilterModalVisible(true)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                    >
                        <Filter size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* List Data */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    <Text className="mt-4 text-gray-500">Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <FlatList
                    data={writingExercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={(item) => item.id.toString()}

                    // Logic Pagination
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5} // Load khi còn cách đáy 50%

                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}

                    // Pull to Refresh
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#FF6B6B']} />
                    }

                    // Styling
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Topic Filter Modal */}
            <TopicFilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                topics={topicFilters}
                onSelectTopic={handleSelectTopic}
            />
        </SafeAreaView>
    );
}