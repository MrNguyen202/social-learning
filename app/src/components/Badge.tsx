import React from "react";
import { Text, View, ViewStyle, TextStyle } from "react-native";

type Size = "sm" | "md" | "lg";
type Variant = "dot" | "count" | "text";

interface BadgeProps {
    variant?: Variant;
    size?: Size;
    color?: "red" | "green" | "blue" | "amber"; // chỉ cho phép màu có trong mapping
    text?: string | number;
    max?: number; // khi variant === "count", hiển thị max+
    rounded?: boolean;
    outline?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

// mapping màu -> tailwind classes
const colorMap = {
    red: {
        bg: "bg-red-600",
        border: "border-red-500",
        text: "text-red-600",
    },
    green: {
        bg: "bg-green-600",
        border: "border-green-500",
        text: "text-green-600",
    },
    blue: {
        bg: "bg-blue-600",
        border: "border-blue-500",
        text: "text-blue-600",
    },
    amber: {
        bg: "bg-amber-600",
        border: "border-amber-500",
        text: "text-amber-600",
    },
} as const;

export default function Badge({
    variant = "count",
    size = "md",
    color = "red",
    text,
    max = 99,
    rounded = true,
    outline = false,
    style,
    textStyle,
}: BadgeProps) {
    // mapping size -> tailwind classes
    const sizeMap = {
        sm: {
            container: "px-1.5 py-0.5 min-w-[18] h-4",
            text: "text-xs",
            dot: "w-2 h-2",
        },
        md: {
            container: "px-2 py-0.5 min-w-[22] h-6",
            text: "text-xs",
            dot: "w-2.5 h-2.5",
        },
        lg: {
            container: "px-2.5 py-0.5 min-w-[26] h-7",
            text: "text-sm",
            dot: "w-3 h-3",
        },
    } as const;

    const s = sizeMap[size];
    const { bg, border, text: textColor } = colorMap[color] ?? colorMap.red;

    const bgClass = outline ? border : bg;
    const textColorClass = outline ? textColor : "text-white";
    const borderClass = outline ? "border" : "";
    const radiusClass = rounded ? "rounded-full" : "rounded";

    // render variants
    if (variant === "dot") {
        return (
            <View
                // @ts-ignore nativewind
                className={`${s.dot} ${bgClass} ${radiusClass} ${outline ? "border-2" : ""}`}
                style={style}
                accessibilityLabel="notification-dot"
                accessible
            />
        );
    }

    if (variant === "text") {
        return (
            <View
                // @ts-ignore nativewind
                className={`${s.container} ${borderClass} ${radiusClass} items-center justify-center ${outline ? "bg-transparent" : bgClass}`}
                style={style}
                accessible
                accessibilityRole="text"
            >
                <Text
                    // @ts-ignore nativewind
                    className={`${s.text} ${textColorClass} px-1`}
                    style={textStyle}
                >
                    {String(text ?? "")}
                </Text>
            </View>
        );
    }

    // default: count
    const count = typeof text === "number" ? text : Number(text ?? 0);
    const display =
        typeof count === "number" && !Number.isNaN(count)
            ? count > max
                ? `${max}+`
                : `${count}`
            : String(text ?? "");

    return (
        <View
            // @ts-ignore nativewind
            className={`${s.container} ${borderClass} ${radiusClass} items-center justify-center ${outline ? "bg-transparent" : bgClass}`}
            style={style}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`badge-${display}`}
        >
            <Text
                // @ts-ignore nativewind
                className={`${s.text} ${textColorClass} font-medium`}
                style={textStyle}
            >
                {display}
            </Text>
        </View>
    );
}
