import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing } from "react-native";
import { Lightbulb, SearchCheck, Send, SquarePlus } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";

type FloatingMenuProps = {
    onCheck: () => void;
    onHint: () => void;
    onSubmit: () => void;
};

export default function FloatingMenu({ onCheck, onHint, onSubmit }: FloatingMenuProps) {
    const [open, setOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        setOpen(!open);
        Animated.timing(animation, {
            toValue: open ? 0 : 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();
    };

    // Góc 3 nút bung ra: 270° → chia đều thành các hướng
    const buttons = [
        { icon: <SearchCheck size={22} color="#fff" />, color: "#10b981", action: onCheck },
        { icon: <Lightbulb size={22} color="#fff" />, color: "#f59e0b", action: onHint },
        { icon: <Send size={22} color="#fff" />, color: "#3b82f6", action: onSubmit },
    ];

    return (
        <View style={styles.container}>
            {buttons.map((btn, index) => {
                const startAngle = 90;   // Bắt đầu hướng lên
                const endAngle = 180;    // Kết thúc hướng trái
                const angle = startAngle + (index * (endAngle - startAngle)) / (buttons.length - 1);

                const x = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 90 * Math.cos((angle * Math.PI) / 180)],
                });

                const y = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -90 * Math.sin((angle * Math.PI) / 180)],
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.option,
                            { transform: [{ translateX: x }, { translateY: y }, { scale: animation }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: btn.color }]}
                            onPress={btn.action}
                            activeOpacity={0.8}
                        >
                            {btn.icon}
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* Nút trung tâm */}
            <LinearGradient
                colors={['#EE9A00', '#EEEE00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{borderRadius: 50}}
            >
                <TouchableOpacity style={styles.mainButton} onPress={toggleMenu} activeOpacity={0.9}>
                    <SquarePlus size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 60,
        right: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    mainButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    option: {
        position: "absolute",
        bottom: 0,
        right: 0,
    },
    optionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
    },
});
