import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    // 2. Xóa Modal, X
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, BookText, Filter } from 'lucide-react-native';

// Import API client
import { getAllTopics, getLevelBySlug, getTypeParagraphBySlug } from '../../../api/learning/route';
import { getListWritingParagraphsByTypeLevelTypeParagraph } from '../../../api/learning/writing/route';

// Import Card
import CardWritingExercise from './components/CardExercise';

import TopicFilterModal from './components/TopicFilterModal';

type PageParams = { type: string; level: string; typeParagraph: string; };
type PageRouteProp = RouteProp<{ params: PageParams }, 'params'>;
interface WritingExercise { id: string; title: string; content_vi: string; label: string; progress: number; topic_id: number; };
type Topic = { id: number; icon: { name: string; color: string; }; name_vi: string; name_en: string; slug: string; description_vi: string; description_en: string; };

const ITEMS_PER_PAGE = 6;

export default function ListExerciseWriting() {
    const navigation = useNavigation<any>();
    const route = useRoute<PageRouteProp>();
    const { type, level, typeParagraph } = route.params;

    const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);
    const [levelExerciseName, setLevelExerciseName] = useState<string>("");
    const [typeParagraphsName, setTypeParagraphsName] = useState<string>("");
    const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<{ id: number; slug: string; name_vi: string }>({ id: 0, slug: 'all', name_vi: 'Tất cả chủ đề' });
    const [selectedTypeParagraph, setSelectedTypeParagraph] = useState<string>(typeParagraph as string || "all");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState(true);
    // --- 1. Fetch Metadata (Level name, Topics list) - Chạy 1 lần ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [levelNameData, topicsData, typeParagraphData] = await Promise.all([
                    getLevelBySlug(level),
                    getAllTopics(),
                    getTypeParagraphBySlug(typeParagraph),
                ]);

                if (levelNameData) setLevelExerciseName(levelNameData.name_vi);

                // Cập nhật tên Topic hiển thị ban đầu nếu có
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


    // --- 2. Main Fetch Function (Gọi API lấy bài tập) ---
    const fetchExercises = async (pageToLoad: number, isReset: boolean = false) => {
        try {
            // Xác định topic slug để gửi lên API
            // Nếu API yêu cầu slug cụ thể cho 'all', hãy sửa ở đây (ví dụ để string rỗng "")
            const topicSlug = selectedTopic.slug;

            const response = await getListWritingParagraphsByTypeLevelTypeParagraph(
                type,
                level,
                topicSlug,
                pageToLoad,
                ITEMS_PER_PAGE
            );

            // Xử lý dữ liệu trả về từ API (dạng { data, totalPages, ... })
            const newData = response.data || [];
            const totalPages = response.totalPages || 1;

            if (isReset) {
                setWritingExercises(newData);
            } else {
                setWritingExercises(prev => [...prev, ...newData]);
            }

            // Cập nhật trạng thái hasMore
            setHasMore(pageToLoad < totalPages);

        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // --- 3. Effect khi thay đổi Filter (Topic) ---
    useEffect(() => {
        // Reset state
        setPage(1);
        setHasMore(true);
        setIsLoading(true);

        // Gọi API trang 1 với chế độ reset
        fetchExercises(1, true);
    }, [selectedTopic.slug]); // Chỉ chạy lại khi slug thay đổi


    // --- 4. Handlers ---
    const handleStartWritingExercise = (exerciseId: string) => {
        navigation.navigate('WritingDetail', { id: exerciseId });
    };

    const handleSelectTopic = (arg: { id: number; slug: string; name_vi: string } | 'all') => {
        if (arg === 'all') {
            setSelectedTopic({ id: 0, slug: 'all', name_vi: 'Tất cả chủ đề' });
        } else {
            setSelectedTopic({ id: arg.id, slug: arg.slug, name_vi: arg.name_vi });
        }
        setIsFilterModalVisible(false);
        // useEffect ở mục 3 sẽ tự động bắt sự thay đổi của selectedTopic và gọi API
    };

    const handleLoadMore = () => {
        if (!isLoading && !isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchExercises(nextPage, false); // false = append mode
        }
    };

    // --- 5. Renders ---
    const renderExerciseItem = ({ item }: { item: WritingExercise }) => (
        <CardWritingExercise
            title={item.title}
            content_vi={item.content_vi}
            label={item.label}
            // progress={item.progress || 0} // Nên dùng progress thật từ API
            progress={70}
            handleStart={() => handleStartWritingExercise(item.id)}
        />
    );

    const renderEmptyList = () => {
        if (isLoading) return null; // Không hiện empty khi đang loading lần đầu
        return (
            <View className="flex-1 items-center justify-center mt-20">
                <BookText size={64} color="#ccc" />
                <Text className="mt-4 text-gray-500 text-lg">Không tìm thấy bài tập nào</Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return <View className="h-6" />; // Spacer
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color="#FF6B6B" />
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
                className="p-5"
            >
                <View className="flex flex-row items-center justify-center relative">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute left-0 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="flex items-center justify-center flex-1">
                        <Text className="text-white text-[20px] font-semibold">
                            {levelExerciseName || "Danh sách bài tập"}
                        </Text>
                        <Text className="text-white text-[14px] opacity-90">
                            {/* Hiển thị tên topic đang lọc */}
                            {selectedTopic.slug === 'all' ? 'Tất cả chủ đề' : selectedTopic.name_vi}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsFilterModalVisible(true)}
                        className="absolute right-0 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <Filter size={24} color="#fff" />
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
                <>
                    <View className="mt-2 mb-1 px-4">
                        <Text className='font-semibold text-xl text-gray-800'>
                            {selectedTopic.name_vi}
                        </Text>
                    </View>

                    <FlatList
                        data={writingExercises} // Dữ liệu trực tiếp từ API
                        renderItem={renderExerciseItem}
                        keyExtractor={(item) => item.id.toString()} // Đảm bảo key là string

                        // Xử lý Empty & Footer
                        ListEmptyComponent={renderEmptyList}
                        ListFooterComponent={renderFooter}

                        // Styling
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}

                        // Infinite Scroll Props
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5} // Load khi còn cách đáy 50% màn hình
                    />
                </>
            )}

            {/* Modal lọc chủ đề */}
            <TopicFilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                topics={topicFilters}
                onSelectTopic={handleSelectTopic}
            />
        </SafeAreaView>
    );
}