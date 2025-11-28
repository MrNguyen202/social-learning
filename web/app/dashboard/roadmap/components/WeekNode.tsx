import { motion } from "framer-motion"

type Week = {
    week: number
    focus_vi: string
    focus_en: string
    lessons: Lesson[]
    isCompleted?: boolean
}

type Lesson = {
    type: string
    level_vi: string
    level_en: string
    topic_vi: string
    topic_en: string
    description_vi: string
    description_en: string
    quantity: number
    completedCount: number
    typeParagraph?: string
    isCompleted?: boolean
}

const WeekNode = ({
    week,
    expandedWeeks,
    toggleWeek,
}: {
    week: Week
    expandedWeeks: number[]
    toggleWeek: (week: number) => void
}) => {
    const isOpen = expandedWeeks.includes(week.week)

    return (
        // Container chính KHÔNG nhận event — tránh chặn hover các nút kế bên
        <div className="relative pointer-events-none">
            {/* Node chính - CÓ nhận event */}
            <motion.div
                className="relative cursor-pointer pointer-events-auto rounded-full"
                onClick={() => toggleWeek(week.week)}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                animate={
                    isOpen
                        ? { scale: 1.3, boxShadow: "0 0 25px rgba(16,185,129,0.7)" }
                        : { scale: 1, boxShadow: "0 0 15px rgba(56,189,248,0.5)" }
                }
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                {/* Hiệu ứng phát sáng - KHÔNG nhận event */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-sky-300 blur-lg opacity-70 pointer-events-none"
                    animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Vòng tròn chính - CÓ nhận event */}
                <motion.div
                    className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-full shadow-xl flex items-center justify-center pointer-events-auto"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                >
                    <span className="text-white font-extrabold text-xl drop-shadow-md">
                        {week.week}
                    </span>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default WeekNode
