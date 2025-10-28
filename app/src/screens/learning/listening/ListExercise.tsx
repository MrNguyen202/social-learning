import { FlatList, Text, View, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator } from "react-native";
import CardExercise from "./components/CardExercise";
import { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { listeningService } from "../../../api/learning/listening/route";
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Headphones } from "lucide-react-native";

interface ListeningParagraph {
    id: string;
    title_en: string;
    title_vi: string;
    description: string;
    text_content: string;
    audio_url: string;
    created_at: string;
    progress: number;
}

export default function ListExercise() {
    const [exercises, setExercises] = useState<ListeningParagraph[]>([]);
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { level, topic } = route.params as { level: string; topic: string };
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);
                const res = await listeningService.getListeningExercises(level, topic);
                setExercises(res);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [level, topic]);

    const handleStart = (paragraph: ListeningParagraph) => {
        // Handle start logic here, for example, navigate to a detail screen
        navigation.navigate('ListeningDetail', { id: paragraph.id });
    }

    return (
        <SafeAreaView className="flex-1 bg-[#f9fafb]">
            <LinearGradient
                colors={['#4ECDC4', '#6DD5DB']}
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
                    <View className="flex flex-row items-center justify-center flex-1">
                        <Text className="text-white text-2xl font-semibold">Danh sách bài tập</Text>
                    </View>

                </View>
            </LinearGradient>

            {/* List of Exercises */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ECDC4" />
                    <Text className="mt-4 text-gray-500">Đang tải dữ liệu...</Text>
                </View>
            ) : exercises.length > 0 ? (
                <FlatList
                    data={exercises}
                    className="px-2"
                    renderItem={({ item }) => (
                        <CardExercise paragraph={item} onPress={() => handleStart(item)} />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            ) : (
                <View className="flex-1 items-center justify-center">
                    <Headphones size={64} color="#ccc" />
                    <Text className="mt-4 text-gray-500 text-lg">Không có bài tập nào</Text>
                </View>
            )}
        </SafeAreaView>
    );
}