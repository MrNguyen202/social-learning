"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Check,
    Crown,
    Snowflake,
    X,
    ArrowLeft,
    Star,
    Copy,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getPlans } from "@/app/apiClient/plan/plan";
import { useLanguage } from "@/components/contexts/LanguageContext";
import useAuth from "@/hooks/useAuth";
import { createOrder, updateOrderStatus } from "@/app/apiClient/order/order";
import { getSocket } from "@/socket/socketClient";
import CountdownTimer from "./CountdownTimer";
import { useScore } from "@/components/contexts/ScoreContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Order = {
    id: string;
    order_code: string;
    user_id: string;
    plan_id: number;
    amount: number;
    paid_amount: number;
    status: "PENDING" | "PAID" | "CANCELLED" | "LACK";
    created_at: string;
    updated_at: string;
}

const PAYMENT_TIMEOUT_SECONDS = 600; // 10 phút (Ví dụ)

// --- TYPES ---
type PlanType = "SUBSCRIPTION" | "SNOWFLAKE";
type Step = "LIST" | "CONFIRM" | "PAYMENT";

interface Plan {
    id: number;
    name: string;
    price: number;
    type: PlanType;
    value?: number;
    isPopular?: boolean;
    [key: string]: any;
}

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Animation Variants
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.98,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.98,
    }),
};

// Animation cho nội dung success
const successContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Các phần tử con hiện lần lượt
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 100 },
    },
};

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { t, language } = useLanguage();
    const { user, setUser } = useAuth();
    const { setScore } = useScore();

    // --- STATE CHUNG ---
    const [activeTab, setActiveTab] = useState<PlanType>("SUBSCRIPTION");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [step, setStep] = useState<Step>("LIST");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [direction, setDirection] = useState(0);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // --- STATE THANH TOÁN ---
    const [isPaid, setIsPaid] = useState(false);

    // [NEW] State xử lý thất bại
    const [isFailed, setIsFailed] = useState(false);
    const [failReason, setFailReason] = useState<string>("");

    const [copiedField, setCopiedField] = useState<string | null>(null);

    // State thời gian
    const [isExpired, setIsExpired] = useState(false);

    // Load danh sách gói khi mở modal
    useEffect(() => {
        if (isOpen && plans.length === 0) {
            const fetchPlans = async () => {
                try {
                    const data = await getPlans();
                    setPlans(data);
                } catch (error) {
                    console.error("Failed to fetch plans", error);
                }
            };
            fetchPlans();
        }
    }, [isOpen]);

    // Hàm reset modal về trạng thái ban đầu (Về Step 1)
    const resetModal = () => {
        // Reset ngay lập tức các UI state để người dùng không thấy giật
        setStep("LIST");
        setSelectedPlan(null);
        setActiveTab("SUBSCRIPTION");
        setIsPaid(false);
        setIsFailed(false); // Reset fail
        setFailReason("");  // Reset lý do fail
        setOrder(null);
        setIsExpired(false);
        setDirection(-1); // Animation back
    };

    // Hàm thực hiện đóng modal và reset (Logic cũ)
    const forceClose = () => {
        onClose();
        setTimeout(() => resetModal(), 300);
        setShowExitConfirm(false);
    };

    // Hàm chặn sự kiện đóng để kiểm tra (Gán vào onOpenChange và nút X)
    const handleClose = () => {
        if (loadingId) return;

        // Nếu đang ở bước thanh toán và chưa hoàn tất -> Hiện cảnh báo
        if (step === "PAYMENT" && !isPaid && !isFailed && !isExpired) {
            setShowExitConfirm(true);
            return;
        }

        // Nếu không thì đóng luôn
        forceClose();
    };

    // Hàm xử lý khi người dùng chọn "Đồng ý thoát" trên modal xác nhận
    const handleConfirmExit = async () => {
        // Hủy đơn hàng
        if (order) {
            // Không cần await để UI phản hồi nhanh hơn, hoặc await nếu muốn chắc chắn
            await updateOrderStatus(order.id, 0, "CANCELLED").catch(console.error);
        }
        forceClose();
    };

    // Helper format tiền tệ VND
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);

    // --- LOGIC SOCKET ---
    // Lắng nghe sự kiện từ Server
    useEffect(() => {
        // Chỉ lắng nghe khi ở bước PAYMENT và đã có Order
        if (step !== "PAYMENT" || !order || isPaid || isFailed) return;

        const socket = getSocket();

        // Xử lý thành công
        const handleSuccess = (data: any) => {
            if (data.orderId === order.id) {
                setIsPaid(true);
            }
            if (data.dataUpdate) {
                if (data.dataUpdate.type === 'SUBSCRIPTION' && data.dataUpdate.userData) {
                    setUser((prev: any) => ({
                        ...prev,
                        ...data.dataUpdate.userData,
                    }));
                } else if (data.dataUpdate.type === 'SNOWFLAKE' && data.dataUpdate.scoreData) {
                    setScore((prevScore) => ({
                        ...prevScore,
                        ...data.dataUpdate.scoreData,
                    }));
                }
            }
        };

        // Xử lý thất bại (Gửi sai tiền, hoặc lỗi khác từ server)
        const handleFailed = (data: any) => {
            if (data.orderId === order.id) {
                setIsFailed(true);
                setFailReason(data.message_vn || "Giao dịch không hợp lệ.");
            }
        };

        socket.on("order-success", handleSuccess);
        socket.on("order-failed", handleFailed);

        return () => {
            socket.off("order-success", handleSuccess);
            socket.off("order-failed", handleFailed);
        };
    }, [step, order, isPaid, isFailed]);


    // --- LOGIC ĐIỀU HƯỚNG ---
    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setDirection(1);
        setStep("CONFIRM");
    };

    const handleBackToList = () => {
        setDirection(-1);
        setStep("LIST");
        setSelectedPlan(null);
    };

    const handleProceedPayment = async () => {
        if (!selectedPlan) return;
        setLoadingId(selectedPlan.id);

        const response = await createOrder(selectedPlan.id);
        if (!response || response.length === 0) {
            setLoadingId(null);
            return;
        } else {
            const socket = getSocket();
            // Báo cho server biết user này đang chờ thanh toán cho order này
            socket.emit("user-waiting-payment", { userId: user?.id, orderId: response[0].id });
            setOrder(response[0]);
        }

        // Reset states
        setIsPaid(false);
        setIsFailed(false);
        setFailReason("");
        setIsExpired(false);

        setLoadingId(null);
        setDirection(1);
        setStep("PAYMENT");
    };

    // LOGIC COPY & TIMER
    const handleCopy = (text?: string, field?: string) => {
        if (!text || !field) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Effect đếm ngược
    const handleTimerExpire = useCallback(async () => {
        // Cập nhật trạng thái đơn hàng là HẾT HẠN
        if (order) {
            await updateOrderStatus(order.id, 0, "FAILED");
        }
        setIsExpired(true);
    }, [order]);

    const displayedPlans = plans.filter((plan) => plan.type === activeTab);

    // --- RENDERERS ---

    // STEP 1: LIST (Giữ nguyên code của bạn)
    const renderPlanList = () => (
        <div className="flex flex-col h-full w-full justify-center items-center">
            <div className="text-center mb-6 px-4 pt-8 shrink-0 relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("plan.descriptionTitle") || "Đầu tư cho kiến thức"}
                </h2>
                <div className="inline-flex bg-gray-100 p-1 rounded-xl mt-4">
                    <button
                        onClick={() => setActiveTab("SUBSCRIPTION")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "SUBSCRIPTION"
                            ? "bg-white shadow text-rose-600"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {t("plan.planPremium") || "Gói Hội Viên"}
                    </button>
                    <button
                        onClick={() => setActiveTab("SNOWFLAKE")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "SNOWFLAKE"
                            ? "bg-white shadow text-sky-500"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {t("plan.snowflakePlan") || "Nạp Snowflake"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 custom-scrollbar">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mt-4 w-full">
                    {displayedPlans.map((plan) => {
                        const isSub = plan.type === "SUBSCRIPTION";
                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                className={`relative flex flex-col p-6 bg-white rounded-3xl transition-all cursor-pointer border h-full ${plan.isPopular
                                    ? isSub
                                        ? "border-2 border-rose-400 shadow-xl"
                                        : "border-2 border-sky-400 shadow-xl"
                                    : "border-gray-200 hover:shadow-lg"
                                    }`}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 -mt-3 mr-3">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide shadow-sm ${isSub
                                                ? "bg-gradient-to-r from-orange-500 to-rose-500"
                                                : "bg-gradient-to-r from-sky-400 to-cyan-500"
                                                }`}
                                        >
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            {t("plan.popular") || "HOT"}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    {isSub ? (
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${plan.isPopular ? "bg-rose-100 text-rose-600" : "bg-gray-50 text-gray-500"}`}>
                                            <Crown className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-sky-100 text-sky-500">
                                            <Snowflake className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={plan[`name_${language}`]}>
                                    {plan[`name_${language}`]}
                                </h3>
                                <div className="mt-2 flex items-baseline text-gray-900">
                                    <span className="text-2xl font-extrabold tracking-tight">
                                        {formatCurrency(plan.price).replace("₫", "")}
                                    </span>
                                    <span className="ml-1 text-sm font-medium text-gray-500">₫</span>
                                </div>
                                {plan[`subtext_${language}`] && (
                                    <p className="mt-1 text-xs font-bold text-green-600 uppercase">
                                        {plan[`subtext_${language}`]}
                                    </p>
                                )}

                                <ul className="mt-6 space-y-3 mb-6 flex-1">
                                    {(plan[`features_${language}`] ?? []).map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start text-sm text-gray-600 font-medium">
                                            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full py-2 rounded-xl font-bold text-white shadow-md transition-all ${plan.isPopular
                                        ? isSub
                                            ? "bg-gradient-to-r from-orange-500 to-rose-600 hover:shadow-rose-200"
                                            : "bg-gradient-to-r from-sky-400 to-cyan-600 hover:shadow-sky-200"
                                        : isSub
                                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                            : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                                        }`}
                                >
                                    {t("plan.buyNow") || "Mua Ngay"}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // STEP 2: CONFIRM (Giữ nguyên code của bạn)
    const renderConfirm = () => {
        if (!selectedPlan) return null;
        const isSub = selectedPlan.type === "SUBSCRIPTION";

        return (
            <div className="flex flex-col h-full max-w-lg mx-auto w-full px-4 pt-8">
                <button
                    onClick={handleBackToList}
                    className="group self-start mb-6 pl-3 pr-5 py-2 rounded-full bg-white/60 hover:bg-white border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md text-gray-500 hover:text-gray-800 transition-all duration-300 ease-out flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-semibold text-sm tracking-wide items-center">{t("plan.payment.back")}</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col w-full relative">
                    <div className={`p-8 ${isSub ? "bg-gradient-to-br from-orange-100 to-rose-100" : "bg-gradient-to-br from-sky-100 to-cyan-100"}`}>
                        <div className="flex flex-col items-center">
                            {isSub ? (
                                <Crown className="w-10 h-10 text-rose-600" />
                            ) : (
                                <Snowflake className="w-10 h-10 text-sky-500" />
                            )}
                            <h3 className={`text-center mt-2 text-base font-bold uppercase tracking-wider ${isSub ? "text-rose-600" : "text-sky-600"}`}>
                                {t("plan.confirmOrder")}
                            </h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">{t("plan.planName")}</span>
                                <h2 className="text-lg font-bold text-gray-900" >{selectedPlan[`name_${language}`]}</h2>
                            </div>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">{t("plan.total")}</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {formatCurrency(selectedPlan.price)}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">{t("plan.recieve")}</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {isSub ? `${selectedPlan.value} ${t("plan.days")}` : `${selectedPlan.value} ${t("plan.snowflake")}`}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">{t("plan.account")}</span>
                            <span className="font-bold text-gray-900 text-lg">{user?.name}</span>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 mt-auto flex flex-row justify-center items-center">
                        <Button
                            onClick={handleProceedPayment}
                            disabled={loadingId === selectedPlan.id}
                            className={`w-fit py-6 px-8 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center transition-transform hover:scale-[1.02] ${isSub
                                ? "bg-gradient-to-r from-orange-500 to-rose-600 shadow-rose-200"
                                : "bg-gradient-to-r from-sky-400 to-cyan-600 shadow-sky-200"
                                }`}
                        >
                            {loadingId ? "Processing..." : <>{t("plan.getQRcode")}</>}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // STEP 3: PAYMENT
    const renderPayment = () => {
        if (!selectedPlan) return null;

        const isSub = selectedPlan.type === 'SUBSCRIPTION';
        const gradientBg = isSub ? 'from-orange-500 to-rose-600' : 'from-sky-400 to-cyan-600';
        const transferContent = `SEPAY${order?.order_code}`;
        const qrSource = `https://qr.sepay.vn/img?acc=${process.env.NEXT_PUBLIC_ACCOUNT_NO}&bank=${process.env.NEXT_PUBLIC_BANK_ID}&amount=${order?.amount}&des=${encodeURIComponent(transferContent)}`;

        // --- TRƯỜNG HỢP 1: THÀNH CÔNG ---
        if (isPaid) {
            const isSub = selectedPlan.type === 'SUBSCRIPTION';
            // Màu chủ đạo dựa theo loại gói
            const bgColor = isSub ? "bg-rose-100" : "bg-sky-100";
            const buttonGradient = isSub
                ? "bg-gradient-to-r from-orange-500 to-rose-600 shadow-rose-200"
                : "bg-gradient-to-r from-sky-400 to-cyan-600 shadow-sky-200";
            const iconColor = isSub ? "text-rose-600" : "text-sky-500";

            return (
                <motion.div
                    variants={successContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center justify-center h-full w-full p-6 relative overflow-hidden"
                >
                    {/* Background Blob Effect - Tạo chiều sâu */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none ${isSub ? "bg-rose-300" : "bg-sky-300"}`}></div>

                    {/* Icon Success Hoành tráng */}
                    <motion.div variants={itemVariants} className="relative mb-8">
                        {/* Vòng tròn lan tỏa (Pulse effect) */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute inset-0 rounded-full ${bgColor}`}
                        />
                        <div className={`relative w-28 h-28 ${bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            >
                                <CheckCircle className={`w-14 h-14 ${iconColor}`} strokeWidth={3} />
                            </motion.div>
                        </div>
                        {/* Các ngôi sao trang trí nhỏ bay lên */}
                        <motion.div
                            animate={{ y: -10, opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="absolute top-0 right-0"
                        >
                            <Star className={`w-6 h-6 ${isSub ? "text-yellow-400" : "text-cyan-400"} fill-current`} />
                        </motion.div>
                    </motion.div>

                    {/* Tiêu đề & Lời chúc */}
                    <motion.div variants={itemVariants} className="text-center mb-8 z-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {t('plan.payment.successTitle')}
                        </h2>
                        <p className="text-gray-500 max-w-sm mx-auto text-base">
                            {t('plan.payment.successDesc')}
                        </p>
                    </motion.div>

                    {/* Nút đóng */}
                    <motion.div variants={itemVariants} className="z-10">
                        <Button
                            onClick={handleClose}
                            className={`rounded-full px-10 py-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 ${buttonGradient}`}
                        >
                            {t('plan.payment.startNow')}
                        </Button>
                    </motion.div>
                </motion.div>
            );
        }

        // --- TRƯỜNG HỢP 2: THẤT BẠI HOẶC HẾT GIỜ ---
        if (isFailed || isExpired) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
                    >
                        {/* Dùng icon cảnh báo hoặc X */}
                        {isExpired ? <Clock className="w-12 h-12 text-red-500" /> : <XCircle className="w-12 h-12 text-red-600" />}
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isExpired ? "Hết thời gian thanh toán" : "Giao dịch thất bại"}
                    </h2>

                    <p className="text-gray-500 mb-8 max-w-sm">
                        {isExpired
                            ? "Mã QR đã hết hạn. Vui lòng tạo lại đơn hàng mới."
                            : (failReason || "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.")}
                    </p>

                    {/* Nút chuyển về Step 1 */}
                    <Button
                        onClick={resetModal}
                        className="rounded-full px-8 py-6 text-base font-bold bg-gray-900 hover:bg-gray-800 shadow-lg"
                    >
                        {t('plan.common.retry')}
                    </Button>
                </div>
            )
        }

        // --- TRƯỜNG HỢP 3: ĐANG CHỜ THANH TOÁN (QR CODE) ---
        return (
            <div className="flex flex-col lg:flex-row h-full w-full bg-white overflow-hidden">
                {/* Cột trái: Thông tin */}
                <div className="flex-1 p-6 lg:p-10 bg-gray-50 overflow-y-auto flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('plan.payment.title') || 'Thông tin chuyển khoản'}</h3>

                    <div className="space-y-6 text-sm flex-1">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">{t('plan.payment.bankLabel') || 'Ngân hàng'}</span>
                                <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_ID}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-100">
                                <span className="text-gray-500">{t('plan.payment.accountNoLabel') || 'Số tài khoản'}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg text-gray-900">{process.env.NEXT_PUBLIC_ACCOUNT_NO}</span>
                                    <button onClick={() => handleCopy(process.env.NEXT_PUBLIC_ACCOUNT_NO, 'acc')} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                        {copiedField === 'acc' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-gray-100 pt-2">
                                <span className="text-gray-500">{t('plan.payment.accountNameLabel')}</span>
                                <span className="font-bold uppercase text-gray-900">{process.env.NEXT_PUBLIC_ACCOUNT_NAME}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500 mb-2 text-xs uppercase font-bold tracking-wider">{t('plan.payment.contentLabel') || 'Nội dung chuyển khoản'} <span className="text-red-500">*</span></p>
                            <div
                                onClick={() => handleCopy(transferContent, 'content')}
                                className={`flex items-center justify-between bg-yellow-50 p-4 rounded-xl border border-yellow-200 transition-colors group cursor-pointer hover:bg-yellow-100`}
                            >
                                <span className="font-bold text-xl text-gray-900 tracking-tight max-w-2/3 inline-block break-words">{transferContent}</span>
                                <span className="text-xs font-bold text-yellow-700 uppercase px-2 py-1 bg-yellow-200/50 rounded-lg group-hover:bg-yellow-200 transition-colors">
                                    {copiedField === 'content' ? 'Đã chép' : 'Sao chép'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">{t('plan.payment.warning') || 'Vui lòng nhập chính xác nội dung này để được kích hoạt tự động.'}</p>
                        </div>
                    </div>
                </div>

                {/* Cột phải: QR Code & Timer */}
                <div className={`flex-1 p-8 flex flex-col items-center justify-center text-white bg-gradient-to-br ${gradientBg} relative overflow-hidden`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-black rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" /> {t('plan.payment.scanTitle') || 'Quét mã thanh toán'}
                        </h3>

                        {/* --- QR CODE CONTAINER --- */}
                        <div className="relative">
                            <div className={`bg-white p-4 rounded-3xl shadow-2xl mb-6 transform transition-all duration-300 hover:scale-105`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrSource} alt="QR Code" className="w-56 h-56 object-contain mix-blend-multiply" />
                            </div>
                        </div>

                        {/* --- TIMER SECTION --- */}
                        <div className="flex flex-col items-center space-y-2 mb-6">
                            {/* Đồng hồ đếm ngược */}
                            <div className="flex items-center text-white/80 text-sm font-mono bg-black/10 px-3 py-1 rounded-lg">
                                <Clock className="w-3.5 h-3.5 mr-2" />
                                <span>{t('plan.payment.expiresIn')}: <span className="font-bold text-white"><CountdownTimer seconds={PAYMENT_TIMEOUT_SECONDS} onExpire={handleTimerExpire} /></span></span>
                            </div>
                        </div>

                        <p className="text-white/80 text-sm text-center">
                            {t('plan.payment.scanInstruction') || 'Sử dụng App Ngân hàng hoặc Ví điện tử để quét mã.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent
                    className="max-w-[95vw] md:max-w-6xl w-full h-[90vh] 
                md:h-[700px] max-h-[90vh] mx-auto rounded-3xl p-0 overflow-hidden 
                 bg-white border-none outline-none flex flex-col 
                justify-between [&>button]:hidden"
                >
                    <DialogTitle className="hidden">Pricing Modal</DialogTitle>

                    {/* Custom Close Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-900 transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nội dung chính */}
                    <div className="flex-1 relative z-10 w-full overflow-hidden flex flex-col">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
                                className="w-full h-full flex flex-col items-center justify-center"
                            >
                                {step === "LIST" && renderPlanList()}
                                {step === "CONFIRM" && renderConfirm()}
                                {step === "PAYMENT" && renderPayment()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- MODAL XÁC NHẬN THOÁT --- */}
            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
                            <XCircle className="w-6 h-6" />
                            {t('plan.payment.cancelTitle') || "Hủy thanh toán?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-base">
                            {t('plan.payment.cancelDesc') || "Giao dịch đang chờ xử lý. Nếu bạn thoát bây giờ, đơn hàng sẽ bị hủy bỏ. Bạn có chắc chắn muốn rời đi?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                            {t('plan.common.stay') || "Ở lại"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmExit}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md border-0"
                        >
                            {t('plan.common.exit') || "Hủy giao dịch"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>

    );
}