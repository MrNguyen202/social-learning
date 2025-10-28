"use client";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path
import { useWindowSize } from "react-use";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onTryAnother: () => void;
}

export default function CelebrationDialog({ isOpen, onClose, onTryAnother }: Props) {
    const { t } = useLanguage();
    const { width, height } = useWindowSize(); // Get window size for confetti

    return (
        <>
            {isOpen && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.2} // Slightly less gravity
                    tweenDuration={6000} // Longer duration
                />
            )}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white shadow-2xl border-2 border-white">
                    <DialogHeader className="text-center pt-6">
                        <motion.div
                            animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="inline-block mb-4"
                        >
                            <Trophy className="w-20 h-20 drop-shadow-lg" />
                        </motion.div>
                        <DialogTitle className="text-3xl font-bold mb-2 drop-shadow">
                            {t("learning.congratulations")}!
                        </DialogTitle>
                        <DialogDescription className="text-lg text-white/90">
                            {t("learning.completedAllSentences")}
                        </DialogDescription>
                    </DialogHeader>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onTryAnother}
                        className="w-full mt-6 mb-2 px-6 py-3 rounded-xl bg-white text-purple-600 hover:bg-gray-50 transition-all font-bold text-lg shadow-lg border border-purple-100"
                    >
                        {t("learning.tryAnother")}
                    </motion.button>
                </DialogContent>
            </Dialog>
        </>
    );
}