import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Headphones, Radio } from 'lucide-react-native';

// --- API ---
import { getLevelBySlug, getTopicBySlug } from '../../../api/learning/route';
import { listeningService } from '../../../api/learning/listening/route';

// --- Components ---
import CardExercise from './components/CardExercise';

// --- Interface ---
interface ListeningParagraph {
    id: string;
    title_vi: string;
    title_en: string;
    description_vi?: string;
    description_en?: string;
    text_content: string;
    audio_url: string;
    created_at: string;
    progress: number;
    genAI?: any;
}

// Lưu ý: Nên để ITEMS_PER_PAGE khớp hoặc gần giống Web để dễ debug thứ tự
const ITEMS_PER_PAGE = 10;

export default function ListExercise() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { level, topic } = route.params as { level: string; topic: string };

    // --- State ---
    const [exercises, setExercises] = useState<ListeningParagraph[]>([]);
    const [levelName, setLevelName] = useState<string>("");
    const [topicName, setTopicName] = useState<string>("");

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Loading Status
    const [isLoading, setIsLoading] = useState(true);      // Loading lần đầu / Reset
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading khi cuộn thêm
    const [isRefreshing, setIsRefreshing] = useState(false);   // Pull to refresh

    // Dùng Ref để chặn việc gọi API trùng lặp khi đang fetch
    const isFetchingRef = useRef(false);

    // --- 1. Fetch Metadata (Tên Level/Topic) ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [levelData, topicData] = await Promise.all([
                    getLevelBySlug(level),
                    getTopicBySlug(topic)
                ]);
                if (levelData) setLevelName(levelData.name_vi);
                if (topicData) setTopicName(topicData.name_vi);
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };
        fetchMetadata();
    }, [level, topic]);

    // --- 2. Main Fetch Function ---
    const fetchExercises = useCallback(async (page: number, isReset: boolean = false) => {
        // Chặn nếu đang fetch (trừ khi reset)
        if (isFetchingRef.current && !isReset) return;

        isFetchingRef.current = true;

        try {
            if (isReset) {
                setIsLoading(true);
                // Quan trọng: Clear list ngay lập tức để tránh hiện data cũ
                setExercises([]);
            } else {
                setIsLoadingMore(true);
            }

            const response = await listeningService.getListeningExercises(
                level,
                topic,
                page,
                ITEMS_PER_PAGE
            );

            const resData = response.data || [];
            const totalRecords = response.total || 0;
            const calculatedTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

            setTotalPages(calculatedTotalPages || 1);

            if (isReset) {
                // Nếu reset, thay thế hoàn toàn
                setExercises(resData);
            } else {
                // Nếu load more: CHỐNG TRÙNG LẶP (Deduplication)
                // Backend sort đúng, nhưng nếu mạng lag request trùng page, list sẽ bị lặp
                setExercises(prev => {
                    // Tạo Set chứa các ID đã có
                    const existingIds = new Set(prev.map(item => item.id));
                    // Chỉ lấy những item mới chưa có trong list cũ
                    const uniqueNewData = resData.filter((item: ListeningParagraph) => !existingIds.has(item.id));

                    return [...prev, ...uniqueNewData];
                });
            }

        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
            isFetchingRef.current = false;
        }
    }, [level, topic]);

    // --- 3. Initial Load ---
    useEffect(() => {
        // Mỗi khi level/topic thay đổi, reset về trang 1
        setCurrentPage(1);
        fetchExercises(1, true);
    }, [fetchExercises]); // Dependency vào fetchExercises (đã bọc level/topic)

    // --- 4. Handlers ---
    const handleLoadMore = () => {
        // Kiểm tra kỹ điều kiện để không gọi dư thừa
        if (!isLoading && !isLoadingMore && !isFetchingRef.current && currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchExercises(nextPage, false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setCurrentPage(1);
        fetchExercises(1, true);
    };

    const handleStart = (exerciseId: string) => {
        navigation.navigate('ListeningDetail', { id: exerciseId });
    };

    // --- 5. Renders ---
    const renderFooter = () => {
        if (!isLoadingMore) return <View className="h-6" />;
        return (
            <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#4ECDC4" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View className="flex-1 items-center justify-center mt-20 px-10">
                <Headphones size={64} color="#e5e7eb" />
                <Text className="mt-4 text-gray-500 text-lg text-center font-medium">
                    Không tìm thấy bài tập
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f9fafb]">
            <LinearGradient
                colors={['#4ECDC4', '#6DD5DB']}
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
                            {levelName || "Luyện nghe"}
                        </Text>
                        <View className="bg-black/10 px-3 py-0.5 rounded-full mt-1 flex-row items-center">
                            <Radio size={12} color="white" style={{ marginRight: 4 }} />
                            <Text className="text-white text-xs opacity-90">
                                {topicName || "Danh sách bài"}
                            </Text>
                        </View>
                    </View>

                    <View className="w-10 h-10" />
                </View>
            </LinearGradient>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ECDC4" />
                    <Text className="mt-4 text-gray-500">Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <FlatList
                    data={exercises}
                    keyExtractor={(item) => item.id.toString()} // Key bắt buộc phải là string
                    renderItem={({ item }) => (
                        <CardExercise
                            item={item}
                            handleStart={() => handleStart(item.id)}
                        />
                    )}

                    // Logic Infinite Scroll
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3} // Giảm xuống 0.3 để tránh gọi quá sớm khi list chưa render kịp

                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}

                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#4ECDC4']} />
                    }

                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}

                    // Props tối ưu hiệu năng list
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            )}
        </SafeAreaView>
    );
}