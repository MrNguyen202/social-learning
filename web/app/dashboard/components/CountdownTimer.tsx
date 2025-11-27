import React, { useEffect, useState } from "react";

// Component con: Chỉ việc đếm và hiển thị, không quan tâm logic khác
const CountdownTimer = React.memo(({
    seconds,
    onExpire
}: {
    seconds: number,
    onExpire: () => void
}) => {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        // Reset thời gian khi prop seconds thay đổi (khi bấm nút tạo lại mã)
        setTimeLeft(seconds);
    }, [seconds]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire(); // Báo cho cha biết là hết giờ rồi
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onExpire]);

    // Helper format
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return <span className="font-bold text-white">{formatTime(timeLeft)}</span>;
});

export default CountdownTimer;