"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ConversationContextType {
    selectedConversation: any;
    setSelectedConversation: (conversation: any) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
    undefined
);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
    const [selectedConversation, setSelectedConversation] = useState<any>(null);

    useEffect(() => {
        const storedConversation = localStorage.getItem("selectedConversation");
        if (storedConversation) {
            setSelectedConversation(JSON.parse(storedConversation));
        }
    }, []);

    return (
        <ConversationContext.Provider value={{ selectedConversation, setSelectedConversation }}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error("useConversation must be used within ConversationProvider");
    }
    return context;
};
