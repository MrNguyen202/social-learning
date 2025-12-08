import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { createRoadMapForUser } from '../../../../api/learning/roadmap/route';
import { hp } from '../../../../../helpers/common';

interface Props {
    visible: boolean;
    onClose: () => void;
    userId: string;
}

const skillsList = ['Writing', 'Listening', 'Speaking'];

const goalList = [
    'Đọc hiểu tài liệu chuyên ngành',
    'Giao tiếp lưu loát trong công việc',
    'Viết email chuyên nghiệp',
    'Nghe hiểu hội thoại tự nhiên',
    'Thuyết trình bằng tiếng Anh',
    'Thi chứng chỉ (IELTS, TOEIC, ...)',
];

const fields = ['Business', 'Academic', 'Travel', 'IT', 'General'];

const studyTimeOptions = [
    '15 phút/ngày',
    '30 phút/ngày',
    '1 giờ/ngày',
    '2 giờ/ngày',
    'Hơn 2 giờ/ngày',
];

// Helper function to parse time to minutes
const parseTimeToMinutes = (timeStr: string): number => {
    const lowerStr = timeStr.toLowerCase().trim();

    // Match patterns like "15 phút/ngày", "1 giờ/ngày", "2 giờ/ngày"
    const minuteMatch = lowerStr.match(/(\d+)\s*phút/);
    const hourMatch = lowerStr.match(/(\d+)\s*giờ/);

    let totalMinutes = 0;

    if (hourMatch) {
        totalMinutes += parseInt(hourMatch[1]) * 60;
    }

    if (minuteMatch) {
        totalMinutes += parseInt(minuteMatch[1]);
    }

    // Default to 30 minutes if parsing fails
    return totalMinutes || 30;
};

const CreatePathModal = ({ visible, onClose, userId }: Props) => {
    const [step, setStep] = useState(1);
    const [pathName, setPathName] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [goal, setGoal] = useState('');
    const [customGoal, setCustomGoal] = useState('');
    const [field, setField] = useState('');
    const [customField, setCustomField] = useState('');
    const [studyTime, setStudyTime] = useState('');
    const [customStudyTime, setCustomStudyTime] = useState('');
    const [loading, setLoading] = useState(false);

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleCreate = async () => {
        if (!userId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            return;
        }

        setLoading(true);
        try {
            const finalGoal = customGoal.trim() || goal;
            const finalField = customField.trim() || field;
            const finalStudyTime = customStudyTime.trim() || studyTime;

            // Convert study time to minutes
            const minutesPerDay = parseTimeToMinutes(finalStudyTime);

            const inputUser = {
                userId: userId,
                pathName: pathName.trim(),
                targetSkills: skills,
                goal: finalGoal,
                field: finalField,
                studyPlan: {
                    minutesPerDay,
                    rawInput: finalStudyTime,
                },
            };

            await createRoadMapForUser(userId, inputUser);

            Alert.alert(
                'Thành công',
                'Lộ trình học đã được tạo thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            onClose();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating roadmap:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tạo lộ trình học. Vui lòng thử lại sau.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setPathName('');
        setSkills([]);
        setGoal('');
        setCustomGoal('');
        setField('');
        setCustomField('');
        setStudyTime('');
        setCustomStudyTime('');
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    const toggleSkill = (skill: string) => {
        setSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const canProceed = () => {
        if (step === 1) return pathName.trim().length > 0;
        if (step === 2) return skills.length > 0;
        return true;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#d11dce', '#6366f1']}
                        style={styles.header}
                    >
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>✨ Tạo lộ trình học mới</Text>
                            <Text style={styles.headerSubtitle}>
                                Bước {step}/5 • Cá nhân hóa lộ trình
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Step 1: Path Name */}
                        {step === 1 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>Đặt tên lộ trình</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: Lộ trình giao tiếp công sở"
                                    placeholderTextColor="#9ca3af"
                                    value={pathName}
                                    onChangeText={setPathName}
                                />
                            </View>
                        )}

                        {/* Step 2: Skills */}
                        {step === 2 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>
                                    Chọn kỹ năng muốn cải thiện
                                </Text>
                                <View className='gird grid-cols-1 gap-4'>
                                    {skillsList.map((skill) => (
                                        <TouchableOpacity
                                            key={skill}
                                            style={[
                                                styles.skillButton,
                                                skills.includes(skill) && styles.skillButtonActive,
                                            ]}
                                            onPress={() => toggleSkill(skill)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.checkboxContainer}>
                                                <View className='flex flex-row gap-2'>
                                                    <View
                                                        style={[
                                                            styles.checkbox,
                                                            skills.includes(skill) && styles.checkboxActive,
                                                        ]}
                                                    >
                                                        {skills.includes(skill) && (
                                                            <Check size={16} color="#fff" />
                                                        )}
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.skillButtonText,
                                                            skills.includes(skill) &&
                                                            styles.skillButtonTextActive,
                                                        ]}
                                                    >
                                                        {skill}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text className='text-xl'>
                                                        {skill === 'Writing' ? '✍️' : skill === 'Listening' ? '👂' : skill === 'Speaking' ? '🗣️' : '🎯'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Step 3: Goal */}
                        {step === 3 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>
                                    Chọn mục tiêu sử dụng tiếng Anh
                                </Text>
                                <View style={styles.optionsList}>
                                    {goalList.map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[
                                                styles.optionButton,
                                                goal === g && styles.optionButtonActive,
                                            ]}
                                            onPress={() => {
                                                setGoal(g);
                                                setCustomGoal('');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionButtonText,
                                                    goal === g && styles.optionButtonTextActive,
                                                ]}
                                            >
                                                {g}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.orText}>Hoặc nhập mục tiêu khác</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: Chuẩn bị phỏng vấn bằng tiếng Anh"
                                    placeholderTextColor="#9ca3af"
                                    value={customGoal}
                                    onChangeText={(text) => {
                                        setCustomGoal(text);
                                        setGoal('');
                                    }}
                                />
                            </View>
                        )}

                        {/* Step 4: Field */}
                        {step === 4 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>Chọn lĩnh vực áp dụng</Text>
                                <View style={styles.fieldsContainer}>
                                    {fields.map((f) => (
                                        <TouchableOpacity
                                            key={f}
                                            style={[
                                                styles.fieldChip,
                                                field === f && styles.fieldChipActive,
                                            ]}
                                            onPress={() => {
                                                setField(f);
                                                setCustomField('');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.fieldChipText,
                                                    field === f && styles.fieldChipTextActive,
                                                ]}
                                            >
                                                {f}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.orText}>Hoặc nhập lĩnh vực khác</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: Marketing, Giáo dục, Y tế..."
                                    placeholderTextColor="#9ca3af"
                                    value={customField}
                                    onChangeText={(text) => {
                                        setCustomField(text);
                                        setField('');
                                    }}
                                />
                            </View>
                        )}

                        {/* Step 5: Study Time */}
                        {step === 5 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>
                                    Bạn có thể dành bao nhiêu thời gian học mỗi ngày?
                                </Text>
                                <View style={styles.optionsList}>
                                    {studyTimeOptions.map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[
                                                styles.optionButton,
                                                studyTime === t && styles.optionButtonActive,
                                            ]}
                                            onPress={() => {
                                                setStudyTime(t);
                                                setCustomStudyTime('');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionButtonText,
                                                    studyTime === t && styles.optionButtonTextActive,
                                                ]}
                                            >
                                                {t}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.orText}>Hoặc nhập thời gian khác</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: 45 phút/ngày"
                                    placeholderTextColor="#9ca3af"
                                    value={customStudyTime}
                                    onChangeText={(text) => {
                                        setCustomStudyTime(text);
                                        setStudyTime('');
                                    }}
                                />
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {step > 1 && !loading && (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={prevStep}
                                activeOpacity={0.8}
                            >
                                <ArrowLeft size={20} color="#6366f1" />
                                <Text style={styles.backButtonText}>Quay lại</Text>
                            </TouchableOpacity>
                        )}

                        {step < 5 ? (
                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    !canProceed() && styles.nextButtonDisabled,
                                ]}
                                onPress={nextStep}
                                disabled={!canProceed()}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>Tiếp theo</Text>
                                <ArrowRight size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.completeButton,
                                    loading && styles.completeButtonDisabled,
                                ]}
                                onPress={handleCreate}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Check size={20} color="#fff" />
                                        <Text style={styles.completeButtonText}>Hoàn tất</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: hp(80),
        overflow: 'hidden',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerTextContainer: {
        alignItems: 'center',
        paddingRight: 36,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    stepContainer: {
        gap: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#c7d2fe',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    skillButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7ff',
        borderRadius: 12,
        padding: 16,
    },
    skillButtonActive: {
        backgroundColor: '#eef2ff',
        borderColor: '#6366f1',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    skillButtonText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '500',
    },
    skillButtonTextActive: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    optionsList: {
        gap: 8,
    },
    optionButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7ff',
        borderRadius: 12,
        padding: 16,
    },
    optionButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    optionButtonText: {
        fontSize: 15,
        color: '#4f46e5',
        fontWeight: '500',
    },
    optionButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    orText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    fieldsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    fieldChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7ff',
        borderRadius: 20,
    },
    fieldChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    fieldChipText: {
        fontSize: 14,
        color: '#4f46e5',
        fontWeight: '500',
    },
    fieldChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c7d2fe',
    },
    backButtonText: {
        fontSize: 15,
        color: '#6366f1',
        fontWeight: '600',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#6366f1',
        marginLeft: 'auto',
    },
    nextButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    nextButtonText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#10b981',
        marginLeft: 'auto',
    },
    completeButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    completeButtonText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
});

export default CreatePathModal;