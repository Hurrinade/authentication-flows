"use client";

import MessagesPane from "../components/MessagesPane";
import AuthenticationPane from "../components/AuthenticationPane";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../contexts/UserProvider";

export default function SimpleJWT() {
  const { setUser, setShowProtected } = useUser();
  const { isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("api/v1/user");
      if (!response.ok) {
        setUser(null);
        return { message: "Unauthorized" };
      }
      const data = await response.json();
      setShowProtected(true);
      setUser({ email: data.email });
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Simple JWT Authentication
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Pane - Messages */}
          <MessagesPane />

          {/* Right Pane - Authentication */}
          <AuthenticationPane mode="stateless_simple" />
        </div>
      </div>
    </div>
  );
}
