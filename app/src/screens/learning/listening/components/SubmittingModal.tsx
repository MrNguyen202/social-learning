import React from "react";
import { Modal, View, Text, ActivityIndicator } from "react-native";

type Props = {
    visible: boolean;
    message?: string;
};

const SubmittingModal: React.FC<Props> = ({ visible, message = "Đang nộp bài..." }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        backgroundColor: "#fff",
                        width: "70%",
                        borderRadius: 16,
                        paddingVertical: 32,
                        paddingHorizontal: 20,
                        alignItems: "center",
                        elevation: 4,
                    }}
                >
                    <ActivityIndicator size="large" color="#4ECDC4" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: "#374151" }}>
                        {message}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default SubmittingModal;
