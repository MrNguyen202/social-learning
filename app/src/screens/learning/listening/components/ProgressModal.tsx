import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"


type ProgressModalProps = {
    visible: boolean;
    onClose: () => void;
    progress?: any | null;
};

const ProgressModal: React.FC<ProgressModalProps> = ({ visible, onClose, progress }) => {
    if (!visible) return null

    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>📈 Tiến độ học</Text>

                {progress ? (
                    <View className="gap-2" style={styles.progressBox}>
                        <Text style={styles.progressText}>🔰 Trạng thái: {progress?.isCorrect === true ? "Đã hoàn thành" : "Chưa hoàn thành"}</Text>
                        <Text style={styles.progressText}>
                            📅 Số lần nộp: {progress?.submit_times || 0}
                        </Text>
                        <Text style={styles.progressText}>🔥 Điểm cao nhất: {progress?.score}</Text>
                    </View>
                ) : (
                    <Text style={styles.emptyText}>Chưa có dữ liệu tiến độ</Text>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ProgressModal

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
    progressBox: {
        backgroundColor: "#f0fdfa",
        borderWidth: 1,
        borderColor: "#a7f3d0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    progressText: {
        fontSize: 15,
        color: "#374151",
        marginBottom: 6,
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
