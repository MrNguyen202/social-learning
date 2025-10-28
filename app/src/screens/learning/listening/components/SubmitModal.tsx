import { CircleEqual, Snowflake } from "lucide-react-native";
import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";

type SubmitModalProps = {
    visible: boolean;
    onClose: () => void;
    correctCount: number;
    total: number;
    practice_score: number;
    snowflake: number;
};

const SubmitModal: React.FC<SubmitModalProps> = ({
    visible,
    onClose,
    correctCount,
    total,
    practice_score,
    snowflake
}) => {
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;

    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-[rgba(0,0,0,0.5)] items-center justify-center">
                <View className="bg-white p-6 rounded-2xl w-[80%] items-center">
                    <Text className="text-lg font-bold text-gray-800 mb-4">
                        Kết quả của bạn 🎉
                    </Text>

                    <View className="flex flex-row items-center justify-evenly w-full pb-4">
                        <View className="flex flex-row items-center justify-center gap-2">
                            <Text className="text-3xl text-[#EEB422] font-bold">+ {practice_score}</Text>
                            <CircleEqual className="h-10 w-10" color={"#EEB422"} />
                        </View>
                        <View className="flex flex-row items-center justify-center gap-2">
                            <Text className="text-3xl text-[#0000FF] font-bold">+ {snowflake}</Text>
                            <Snowflake className="h-10 w-10" color={"#0000FF"} />
                        </View>
                    </View>

                    {/* ✅ Biểu đồ tròn tiến độ */}
                    <View className="mb-6 items-center justify-center">
                        <View style={{ position: "relative", width: size, height: size }}>
                            <Svg width={size} height={size}>
                                {/* Vòng nền */}
                                <Circle
                                    stroke="#e6e6e6"
                                    fill="none"
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                />
                                {/* Vòng tiến độ */}
                                <Circle
                                    stroke="#4ECDC4"
                                    fill="none"
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    rotation="-90"
                                    originX={size / 2}
                                    originY={size / 2}
                                />
                            </Svg>

                            {/* Text giữa vòng */}
                            <View
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: size,
                                    height: size,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text className="text-xl font-bold text-gray-800">
                                    {Math.round(percentage)}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-gray-600 mb-6">
                        Đúng {correctCount}/{total}
                    </Text>

                    <TouchableOpacity
                        className="bg-[#4ECDC4] px-6 py-3 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-white font-semibold">Tiếp tục</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SubmitModal;
