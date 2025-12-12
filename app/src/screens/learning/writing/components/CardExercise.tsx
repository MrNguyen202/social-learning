import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { User, BookOpen, History, ChevronRight, CheckCircle } from 'lucide-react-native';

type CardProps = {
    title: string;
    content_vi: string;
    label: ImageSourcePropType;
    submitTimes: number;
    isUserGenerated: boolean;
    isCorrect?: boolean | null; // <--- Sửa ở đây: Dùng trực tiếp isCorrect
    handleStart: () => void;
};

export default function CardWritingExercise({
    title,
    content_vi,
    label,
    submitTimes,
    isUserGenerated,
    isCorrect, // <--- Nhận prop isCorrect
    handleStart
}: CardProps) {

    // Kiểm tra trạng thái hoàn thành
    const isFinished = isCorrect === true;

    const typeConfig = isUserGenerated
        ? {
            text: 'Bài tập cá nhân',
            bgColor: '#FFFBEB',
            textColor: '#B45309',
            icon: <User size={14} color="#B45309" />,
            borderColor: '#FCD34D'
        }
        : {
            text: 'Bài tập hệ thống',
            bgColor: '#EFF6FF',
            textColor: '#1D4ED8',
            icon: <BookOpen size={14} color="#1D4ED8" />,
            borderColor: '#93C5FD'
        };

    // Cấu hình nút bấm dựa trên isFinished (từ isCorrect)
    const actionConfig = isFinished
        ? {
            text: 'Hoàn thành',
            color: '#10B981', // Green-500
            icon: <CheckCircle size={16} color="#10B981" />
        }
        : {
            text: 'Làm bài',
            color: '#3B82F6', // Blue-500
            icon: <ChevronRight size={16} color="#3B82F6" />
        };

    return (
        <TouchableOpacity
            style={[styles.card, isFinished && styles.cardCompleted]}
            onPress={handleStart}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.header}>
                <Image source={label} style={{ width: 26, height: 26, borderRadius: 12 }} />
                <View style={[styles.badge, { backgroundColor: typeConfig.bgColor, borderColor: typeConfig.borderColor }]}>
                    {typeConfig.icon}
                    <Text style={[styles.badgeText, { color: typeConfig.textColor }]}>
                        {typeConfig.text}
                    </Text>
                </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={styles.content} numberOfLines={3}>
                    {content_vi}
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.submitInfo}>
                    <History size={16} color="#6B7280" />
                    <Text style={styles.submitText}>
                        Đã nộp: <Text style={styles.submitCount}>{submitTimes}</Text> lần
                    </Text>
                </View>

                <View style={styles.actionBtn}>
                    <Text style={[styles.actionText, { color: actionConfig.color }]}>
                        {actionConfig.text}
                    </Text>
                    {actionConfig.icon}
                </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardCompleted: {
        borderColor: '#D1FAE5', // Viền xanh lá nhạt khi hoàn thành
        backgroundColor: '#F0FDF4', // Nền xanh lá cực nhạt
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    body: {
        marginBottom: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 24,
    },
    content: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    submitInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    submitText: {
        fontSize: 13,
        color: '#6B7280',
    },
    submitCount: {
        fontWeight: '700',
        color: '#374151',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
    },
});