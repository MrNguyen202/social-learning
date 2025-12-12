import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
    User,
    Monitor, // Thay cho icon System
    GraduationCap,
    PlayCircle,
    FastForward
} from 'lucide-react-native';

// Interface khớp với API và logic Web
interface ListeningParagraph {
    id: string;
    title_vi: string;
    title_en: string;
    description_vi?: string;
    description_en?: string;
    progress?: number; // 0 - 100
    genAI?: any;       // Check User vs System
}

interface CardProps {
    item: ListeningParagraph;
    handleStart: () => void;
}

export default function CardExercise({ item, handleStart }: CardProps) {
    // 1. Logic tính toán trạng thái
    const progress = item.progress || 0;
    const isFinished = progress === 100;
    const hasStarted = progress > 0;
    const isUserGenerated = !!item.genAI;

    // 2. Hàm tính màu (Giống Web: getProgressColor)
    const getProgressColor = (percent: number) => {
        if (percent >= 100) return { bar: '#10B981', text: '#059669' }; // Emerald-500/600
        if (percent >= 60) return { bar: '#3B82F6', text: '#2563EB' };  // Blue-500/600
        if (percent >= 30) return { bar: '#EAB308', text: '#CA8A04' };  // Yellow-500/600
        return { bar: '#F97316', text: '#EA580C' };                     // Orange-500/600
    };

    const colorStyles = getProgressColor(progress);

    // 3. Cấu hình Badge (User/System)
    const typeConfig = isUserGenerated
        ? {
            bg: '#FEF3C7', // Amber-100
            icon: <User size={14} color="#B45309" />, // Amber-700
        }
        : {
            bg: '#EFF6FF', // Blue-50 (dùng màu nhẹ cho System)
            icon: <Monitor size={14} color="#1D4ED8" />, // Blue-700
        };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handleStart}
            activeOpacity={0.8}
        >
            {/* --- Badge User/System (Góc trên phải) --- */}
            <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: typeConfig.bg }]}>
                    {typeConfig.icon}
                </View>
            </View>

            {/* --- Content --- */}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title_vi || item.title_en}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description_vi || item.description_en || "Không có mô tả"}
                </Text>
            </View>

            {/* --- Footer (Trạng thái & Progress) --- */}
            <View style={styles.footer}>
                {/* Trạng thái text & Icon */}
                <View style={styles.statusContainer}>
                    {isFinished ? (
                        <>
                            <GraduationCap size={18} color="#16A34A" />
                            <Text style={[styles.statusText, { color: '#16A34A' }]}>Đã hoàn thành</Text>
                        </>
                    ) : hasStarted ? (
                        <>
                            <FastForward size={18} color="#EA580C" />
                            <Text style={[styles.statusText, { color: '#EA580C' }]}>Tiếp tục</Text>
                        </>
                    ) : (
                        <>
                            <PlayCircle size={18} color="#EA580C" />
                            <Text style={[styles.statusText, { color: '#EA580C' }]}>Bắt đầu</Text>
                        </>
                    )}
                </View>

                {/* Thanh Progress Bar (Chỉ hiện khi đã bắt đầu) */}
                {hasStarted && (
                    <View style={styles.progressWrapper}>
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${progress}%`, backgroundColor: colorStyles.bar }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colorStyles.text }]}>
                            {progress}%
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        // Shadow giống Web: shadow-sm hover:shadow-xl
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0', // slate-200
        overflow: 'hidden',
    },
    badgeContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        marginBottom: 16,
        paddingRight: 30, // Tránh đè lên badge
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B', // slate-800
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#64748B', // slate-500
        lineHeight: 20,
        height: 40, // Cố định chiều cao để card đều nhau (option)
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0', // slate-200
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 100, // Độ rộng cố định khu vực progress
    },
    progressBarBackground: {
        flex: 1,
        height: 6,
        backgroundColor: '#F1F5F9', // slate-100
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 99,
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        minWidth: 28,
        textAlign: 'right',
    },
});