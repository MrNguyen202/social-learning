import React from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } // THÊM: Import Modal
    from "react-native"

type HistoryModalProps = {
    visible: boolean;
    onClose: () => void;
    history: any;
    handle: (item: any) => void;
};

const WritingHistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, history, handle }) => {

    // Bỏ "if (!visible) return null"
    const getScore = (item: any) => {
        try {
            return item.feedback.score ?? 'N/A';
        } catch {
            return 'N/A';
        }
    }

    return (
        // THÊM: Bọc mọi thứ trong <Modal>
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose} // Cho phép đóng bằng nút back Android
        >
            {/* View mờ bên ngoài */}
            <View style={styles.modalOverlay}>

                {/* Đây là nội dung modal (giữ nguyên code của bạn) */}
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>📜 Lịch sử nộp bài</Text>

                    <ScrollView style={{ maxHeight: 300 }}>
                        {history.length > 0 ? (
                            history.map((item: any) => (
                                <TouchableOpacity key={item.id} style={styles.historyItem} onPress={() => handle(item)}>
                                    <Text style={styles.historyText}>
                                        🕒 {new Date(item.submit_date).toLocaleString("vi-VN")}
                                    </Text>
                                    <View>
                                        <Text style={styles.historyScore}>
                                            Điểm: {item.feedback?.final_score ?? 'N/A'}
                                        </Text>
                                        <Text style={styles.historyAccuracy}>
                                            Chính xác: {item.feedback?.accuracy ?? 'N/A'}%
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Chưa có lịch sử làm bài</Text>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
                {/* Hết nội dung modal */}

            </View>
        </Modal>
    )
}

export default WritingHistoryModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, // SỬA: Đổi thành flex: 1
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
        // SỬA: Bỏ "position", "zIndex", "top", "left"...
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        width: "85%",
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
    historyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    historyText: {
        fontSize: 14,
        color: "#374151",
    },
    historyScore: {
        fontSize: 14,
        color: "#8A2BE2",
        fontWeight: "bold",
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
    historyAccuracy: {
        fontSize: 14,
        color: "green",
    },
})