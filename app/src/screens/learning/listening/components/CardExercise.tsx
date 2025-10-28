import { CirclePlay } from "lucide-react-native";
import { TouchableOpacity, Text, View } from "react-native";

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

export default function CardExercise({ paragraph, onPress }: { paragraph: ListeningParagraph, onPress: () => void }) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="rounded-3xl p-4 flex-row justify-between items-center w-full bg-slate-200 min-h-28 my-2"
        >
            <View className="flex-1 shrink max-w-[85%]">
                <Text className="text-xl font-bold text-gray-900">{paragraph.title_vi}</Text>
                <Text numberOfLines={2} className="text-md text-gray-600 mt-1">{paragraph.description}</Text>
            </View>
            <View>
                <CirclePlay size={32} color="#4ECDC4" />
            </View>
        </TouchableOpacity>
    );
}