"use client";

import { createContext, useContext, useState } from "react";

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined,
);

interface Message {
  text: string;
  timestamp: Date;
  type: "info" | "success" | "error";
}

interface MessagesContextType {
  messages: Message[];
  addMessage: (text: string, type?: Message["type"]) => void;
  clearMessages: () => void;
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (text: string, type: Message["type"] = "info") => {
    const newMessage: Message = {
      text,
      timestamp: new Date(),
      type,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = (): MessagesContextType => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
