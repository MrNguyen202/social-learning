import React from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

type HistoryModalProps = {
    visible: boolean;
    onClose: () => void;
    history: any;
    handle: (item: any) => void;
};

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, history, handle }) => {
    if (!visible) return null
    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>📜 Lịch sử làm bài</Text>

                <ScrollView style={{ maxHeight: 300 }}>
                    {history.length > 0 ? (
                        history.map((item: any, index: number) => (
                            <TouchableOpacity key={index} style={styles.historyItem} onPress={() => handle(item)}>
                                <Text style={styles.historyText}>
                                    🕒 {new Date(item.created_at).toLocaleString("vi-VN")}
                                </Text>
                                <Text style={styles.historyText}>
                                     {item.answers.filter((answer: any) => answer.is_correct).length}/{item?.answers.length} Từ đúng ✅
                                </Text>
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
        </View>
    )
}

export default HistoryModal

const styles = StyleSheet.create({
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
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
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginVertical: 8,
    },
    closeButton: {
        backgroundColor: "#4ECDC4",
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
})
