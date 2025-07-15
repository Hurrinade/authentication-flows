"use client";

import { createContext, useContext, useState } from "react";

const UserContext = createContext<UserContextType | undefined>(undefined);

interface User {
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  showProtected: boolean;
  setShowProtected: (showProtected: boolean) => void;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showProtected, setShowProtected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        showProtected,
        setShowProtected,
        accessToken,
        setAccessToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
