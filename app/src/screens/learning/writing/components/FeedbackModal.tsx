import React from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal }
    from "react-native"

type FeedbackModalProps = {
    visible: boolean;
    onClose: () => void;
    feedback: any | null;
    loading: boolean;
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose, feedback, loading }) => {

    /**
     * HÀM MỚI 1: Render dòng highlight (giống code web)
     * Phân tích (từ sai) và [từ đúng]
     */
    const renderHighlight = (text: string) => {
        // Chẻ chuỗi tại (nội dung) và [nội dung]
        const parts = text.split(/(\(.*?\)|\[.*?\])/g).filter(Boolean);

        return (
            <Text style={styles.highlightBaseText}>
                {parts.map((part, idx) => {
                    // (từ sai) -> Màu đỏ, gạch ngang
                    if (part.startsWith("(") && part.endsWith(")")) {
                        const wrongWord = part.slice(1, -1); // Bỏ dấu ()
                        return (
                            <Text key={idx} style={styles.redText}>
                                {wrongWord}
                            </Text>
                        );
                    }
                    // [từ đúng] -> Màu xanh, in đậm
                    if (part.startsWith("[") && part.endsWith("]")) {
                        const rightWord = part.slice(1, -1); // Bỏ dấu []
                        return (
                            <Text key={idx} style={styles.greenText}>
                                {rightWord}
                            </Text>
                        );
                    }
                    // Text thường
                    return <Text key={idx}>{part}</Text>;
                })}
            </Text>
        );
    };

    /**
     * HÀM MỚI 2: Render dòng suggestion (giống code web)
     * Phân tích 'từ trong ngoặc'
     */
    const renderSuggestion = (text: string) => {
        // Chẻ chuỗi tại 'nội dung'
        const parts = text.split(/('.*?')/g).filter(Boolean);

        return (
            <Text style={styles.suggestionText}>
                {parts.map((part, idx) => {
                    // 'từ' -> Màu xanh, in đậm (giống code web)
                    if (part.startsWith("'") && part.endsWith("'")) {
                        return (
                            <Text key={idx} style={styles.blueText}>
                                {part}
                            </Text>
                        );
                    }
                    // Text thường
                    return <Text key={idx}>{part}</Text>;
                })}
            </Text>
        );
    };

    // Hàm render chính
    const renderFeedback = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#8A2BE2" />;
        }
        if (!feedback) {
            return <Text style={styles.emptyText}>Không có nhận xét.</Text>;
        }
        return (
            <View>
                <Text style={styles.feedbackScoreText}>
                    Điểm tổng: <Text style={styles.feedbackScore}>{feedback.final_score}</Text> |
                    Chính xác: <Text style={styles.feedbackAccuracy}>{feedback.accuracy}%</Text>
                </Text>

                <Text style={styles.feedbackScoreText}>
                    Điểm ngữ pháp: <Text className="font-bold text-purple-600">{feedback.grammar}</Text> | 
                    Điểm từ vựng: <Text className="font-bold text-yellow-600">{feedback.vocabulary}</Text>
                </Text>

                {/* Phần lỗi đã được cập nhật */}
                {feedback.errors && feedback.errors.length > 0 && (
                    <View>
                        <Text style={styles.feedbackErrorTitle}>Các lỗi cần cải thiện</Text>
                        {feedback.errors.map((err: any, i: number) => (
                            <View key={i} style={styles.feedbackErrorItem}>

                                {/* 1. Dòng highlight (đã phân tích) */}
                                {renderHighlight(err.highlight)}

                                {/* 2. Danh sách suggestion (đã phân tích) */}
                                <View style={styles.suggestionList}>
                                    {err.suggestion.map((s: string, j: number) => (
                                        <View key={j} style={styles.suggestionItem}>
                                            <Text style={styles.suggestionBullet}>• </Text>
                                            {/* Dùng hàm renderSuggestion */}
                                            {renderSuggestion(s)}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                {/* Hết phần lỗi */}

                <Text style={styles.feedbackCommentTitle}>Nhận xét tổng quan</Text>
                <Text style={styles.feedbackComment}>{feedback.comment}</Text>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>🤖 Nhận xét AI</Text>
                    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                        {renderFeedback()}
                    </ScrollView>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default FeedbackModal

const styles = StyleSheet.create({
    // ... (Styles của modal, overlay, container, button... giữ nguyên) ...
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        width: "90%",
        padding: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 16,
        textAlign: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginVertical: 8,
    },
    closeButton: {
        backgroundColor: "#8A2BE2",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 16,
    },
    closeText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },

    // --- CÁC STYLE MỚI CHO VIỆC TÔ MÀU ---

    feedbackScoreText: {
        textAlign: 'center', color: '#374151',
        marginBottom: 16, // Thêm khoảng cách
        fontSize: 16,
    },
    feedbackScore: { fontWeight: 'bold', color: '#16A34A' },
    feedbackAccuracy: { fontWeight: 'bold', color: '#2563EB' },

    feedbackErrorTitle: {
        fontWeight: '600',
        marginBottom: 12, // Thêm khoảng cách
        color: '#111827',
        fontSize: 16,
    },

    feedbackErrorItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
        marginBottom: 12,
    },

    // Style cho dòng highlight (e.g., "Đây là (sai) [đúng]")
    highlightBaseText: {
        fontSize: 16, // Giống code web 'text-md'
        color: '#374151', // Màu text gốc
        lineHeight: 24,
    },
    redText: {
        color: '#ef4444', // text-red-500
        textDecorationLine: 'line-through', // line-through
        marginHorizontal: 1, // mx-1
    },
    greenText: {
        color: '#16a34a', // text-green-600
        fontWeight: 'bold', // font-bold
        marginHorizontal: 1, // mx-1
    },

    // Style cho danh sách suggestion (e.g., "• Dùng 'đúng'")
    suggestionList: {
        marginTop: 8, // mt-2
        paddingLeft: 16, // Tương đương list-inside
    },
    suggestionItem: {
        flexDirection: 'row',
    },
    suggestionBullet: {
        color: '#6b7280', // text-gray-600
        fontSize: 14, // text-sm
        marginRight: 4,
    },
    suggestionText: {
        color: '#6b7280', // text-gray-600
        fontSize: 14, // text-sm
        flex: 1,
    },
    blueText: {
        color: '#1d4ed8', // text-blue-800
        fontWeight: 'bold', // font-bold
    },

    // Style cho nhận xét chung
    feedbackCommentTitle: {
        fontWeight: '600',
        marginTop: 8,
        color: '#111827',
        fontSize: 16,
    },
    feedbackComment: {
        color: '#374151',
        lineHeight: 22,
        fontSize: 15,
    },
});