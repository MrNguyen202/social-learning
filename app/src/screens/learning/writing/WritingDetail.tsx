import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
// Thêm icon BookOpen và PenTool
import { Snowflake, CircleEqual, ArrowLeft, Menu, FileText, BookOpen, PenTool } from "lucide-react-native";
import LinearGradient from 'react-native-linear-gradient';
import Toast from "react-native-toast-message";
import useAuth from "../../../../hooks/useAuth";

// Import API
import {
    getWritingParagraphById,
    getHistorySubmitWritingParagraphByUserAndParagraph,
    submitWritingParagraphExercise,
    feedbackWritingParagraphExercise,
} from "../../../api/learning/writing/route";
import { getScoreUserByUserId } from '../../../api/learning/score/route';

// Import components
import FloatingMenu from './components/FloatingMenu';
import WritingHistoryModal from './components/HistoryModal';
import WritingProgressModal from './components/ProgressModal';
import WritingSubmitModal from './components/SubmitModal';
import FeedbackModal from "./components/FeedbackModal";
import SubmittingModal from "./components/SubmittingModal";

type DetailRouteParams = { id: number; };
type DetailRouteProp = RouteProp<{ params: DetailRouteParams }, 'params'>;

export default function ExerciseDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<DetailRouteProp>();
    const { user } = useAuth();
    const id = Number(route.params?.id ?? 0);

    const [exercise, setExercise] = useState<any>(null);
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [score, setScore] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Feedback/Submit states
    const [feedback, setFeedback] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
    const [submitResult, setSubmitResult] = useState({ score: 0, snowflake: 0 });

    // Modal states
    const [showTopMenu, setShowTopMenu] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // 1. STATE QUẢN LÝ TAB (Mặc định là xem đề)
    const [activeTab, setActiveTab] = useState<'question' | 'answer'>('question');

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;
            setPageLoading(true);
            try {
                const [data, userScore, hist] = await Promise.all([
                    getWritingParagraphById(id),
                    getScoreUserByUserId(user.id),
                    getHistorySubmitWritingParagraphByUserAndParagraph(user.id, String(id))
                ]);

                setExercise(data);
                setScore(userScore.data);
                setHistory(hist);
                computeProgress(hist);

            } catch (error) {
                console.error("Failed to load exercise data", error);
                Toast.show({ type: 'error', text1: 'Lỗi tải bài tập' });
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const computeProgress = (hist: any[]) => {
        if (hist.length === 0) {
            setProgress({ submit_times: 0, score: 0, isCorrect: false });
            return;
        }
        const bestScore = Math.max(
            ...hist.map((h) => {
                try {
                    return JSON.parse(h.feedback)?.score ?? 0;
                } catch { return 0; }
            })
        );
        setProgress({
            submit_times: hist.length,
            score: bestScore,
            isCorrect: bestScore >= 80
        });
    };

    const handleSubmit = async () => {
        if (!exercise) return;
        setIsSubmitting(true);
        try {
            const res = await submitWritingParagraphExercise(user.id, exercise.id, inputValue);
            setFeedback(res.data.feedback);
            setSubmitResult({ score: res.data.score, snowflake: res.data.snowflake });

            setScore((s: any) => ({
                ...s,
                practice_score: s.practice_score + res.data.score,
                number_snowflake: s.number_snowflake + res.data.snowflake,
            }));

            const hist = await getHistorySubmitWritingParagraphByUserAndParagraph(user.id, String(exercise.id));
            setHistory(hist);
            computeProgress(hist);

            setShowSubmitModal(true);
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Lỗi khi nộp bài' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFeedback = async () => {
        if (!exercise) return;
        if (score.number_snowflake < 2) {
            Toast.show({ type: "error", text1: "Không đủ Snowflake!" });
            return;
        }
        setIsFetchingFeedback(true);
        try {
            const res = await feedbackWritingParagraphExercise(user.id, exercise.id, inputValue);
            setFeedback(res.data);
            setScore((s: any) => ({
                ...s,
                number_snowflake: Math.max(0, s.number_snowflake - 2),
            }));
            setShowFeedbackModal(true);
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Lỗi khi lấy gợi ý' });
        } finally {
            setIsFetchingFeedback(false);
        }
    };

    const handleHistorySelect = (historyItem: any) => {
        if (!historyItem) return;
        let parsedFeedback = null;
        try {
            parsedFeedback = historyItem.feedback ? historyItem.feedback : null;
        } catch { }

        setInputValue(historyItem.content_submit);
        setFeedback(parsedFeedback);
        setShowHistoryModal(false);

        // 2. TỰ ĐỘNG CHUYỂN TAB SANG BÀI LÀM KHI CHỌN LỊCH SỬ
        setActiveTab('answer');

        if (parsedFeedback) {
            setShowFeedbackModal(true);
        }
    };

    const handleDictionary = () => {
        Alert.alert("Tính năng sắp ra mắt", "Từ điển đang được phát triển.");
    };

    if (pageLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#8A2BE2" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {/* Header Gradient */}
                <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-5 pt-3 pb-10" // Tăng padding bottom để tạo khoảng trống cho Tab Bar đè lên
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className='flex flex-row justify-between items-center z-30'>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className='w-10 h-10 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center'
                                activeOpacity={0.8}
                            >
                                <ArrowLeft size={24} color="#fff" />
                            </TouchableOpacity>

                            <View className='flex-row items-center justify-end gap-3'>
                                <View className='flex flex-row items-center justify-center gap-2 bg-white/20 px-3 py-1 rounded-full'>
                                    <Text className='text-[#0000FF] text-lg font-bold'>{score?.number_snowflake || 0}</Text>
                                    <Snowflake size={18} color={"#0000FF"} />
                                </View>
                                <View className='flex flex-row items-center justify-center gap-2 bg-white/20 px-3 py-1 rounded-full'>
                                    <Text className='text-[#FFFF00] text-lg font-bold'>{score?.practice_score || 0}</Text>
                                    <CircleEqual size={18} color={"#FFFF00"} />
                                </View>
                            </View>

                            <View>
                                <TouchableOpacity
                                    onPress={() => setShowTopMenu((prev) => !prev)}
                                    activeOpacity={0.8}
                                    className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center"
                                >
                                    <Menu size={24} color="#fff" />
                                </TouchableOpacity>

                                {showTopMenu && (
                                    <View className="absolute top-12 -right-3 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-50">
                                        <TouchableOpacity
                                            className="p-3 border-b border-gray-100 flex-row items-center"
                                            onPress={() => { setShowTopMenu(false); setShowHistoryModal(true); }}
                                        >
                                            <Text>📜 Lịch sử</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="p-3 flex-row items-center"
                                            onPress={() => { setShowTopMenu(false); setShowProgressModal(true); }}
                                        >
                                            <Text>📈 Tiến độ</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </LinearGradient>

                {/* 3. TAB BAR UI (Nằm đè lên header nhờ margin âm) */}
                <View className="mx-4 -mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex-row overflow-hidden mb-2 z-10">
                    <TouchableOpacity
                        className={`flex-1 flex-row items-center justify-center py-3 ${activeTab === 'question' ? 'bg-blue-50' : 'bg-white'}`}
                        onPress={() => setActiveTab('question')}
                        activeOpacity={0.7}
                    >
                        <BookOpen size={18} color={activeTab === 'question' ? '#2563EB' : '#6B7280'} />
                        <Text className={`ml-2 font-semibold ${activeTab === 'question' ? 'text-blue-600' : 'text-gray-500'}`}>
                            Đề bài
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="w-[1px] bg-gray-200" />

                    <TouchableOpacity
                        className={`flex-1 flex-row items-center justify-center py-3 ${activeTab === 'answer' ? 'bg-blue-50' : 'bg-white'}`}
                        onPress={() => setActiveTab('answer')}
                        activeOpacity={0.7}
                    >
                        <PenTool size={18} color={activeTab === 'answer' ? '#2563EB' : '#6B7280'} />
                        <Text className={`ml-2 font-semibold ${activeTab === 'answer' ? 'text-blue-600' : 'text-gray-500'}`}>
                            Bài làm
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 4. CONTENT AREA (Switch giữa 2 view) */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-4">
                        {activeTab === 'question' ? (
                            /* VIEW ĐỀ BÀI - Dùng ScrollView để đọc */
                            <ScrollView
                                className="flex-1"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            >
                                <View className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm mt-2">
                                    <View className="flex-col items-center mb-4 gap-2 border-b border-gray-100 pb-3">
                                        <FileText size={24} color="#8A2BE2" />
                                        <Text className="text-xl font-bold text-gray-900 text-center">
                                            {exercise?.title ?? "Loading..."}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-700 text-base leading-7">
                                        {exercise?.content_vi}
                                    </Text>
                                </View>
                            </ScrollView>
                        ) : (
                            /* VIEW BÀI LÀM - Dùng View thường để TextInput full màn hình */
                            <View className="flex-1 mt-2">
                                <View className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-24">
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Nhập đoạn văn của bạn tại đây..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        value={inputValue}
                                        onChangeText={setInputValue}
                                        style={{ textAlignVertical: 'top' }}
                                        autoFocus={true} // Tự động focus khi chuyển tab
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>

            </KeyboardAvoidingView>

            {/* FAB Menu */}
            <FloatingMenu
                onCheck={handleFeedback}
                onHint={handleDictionary}
                onSubmit={handleSubmit}
            />

            {/* Các Modal giữ nguyên */}
            <WritingHistoryModal
                visible={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={history}
                handle={handleHistorySelect}
            />

            <WritingProgressModal
                visible={showProgressModal}
                onClose={() => setShowProgressModal(false)}
                progress={progress}
            />

            <WritingSubmitModal
                visible={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                practice_score={submitResult.score}
                snowflake={submitResult.snowflake}
            />

            <FeedbackModal
                visible={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                feedback={feedback}
                loading={isFetchingFeedback}
            />

            <SubmittingModal visible={isSubmitting} />
        </SafeAreaView>
    );
}