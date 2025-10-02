"use client";

import { getScoreUserByUserId } from "@/app/api/learning/score/route";
import useAuth from "@/hooks/useAuth";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Score {
    id: number;
    userId: number;
    practice_score: number;
    test_score: number;
    number_snowflake: number;
    created_at: string;
}

interface ScoreContextType {
    score: Score | null;
    setScore: (score: Score | null) => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);
export const ScoreProvider = ({ children }: { children: ReactNode }) => {
    const [score, setScore] = useState<Score | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchScore = async () => {
            if (user) {
                try {
                    const response = await getScoreUserByUserId(user?.id);
                    setScore(response.data);
                } catch (error) {
                    console.error("Error fetching score:", error);
                }
            } else {
                setScore(null);
            }
        };
        fetchScore();
    }, [user]);
    return (
        <ScoreContext.Provider value={{ score, setScore }}>
            {children}
        </ScoreContext.Provider>
    );
};

export const useScore = () => {
    const context = useContext(ScoreContext);
    if (!context) {
        throw new Error("useScore must be used within ScoreProvider");
    }
    return context;
};
