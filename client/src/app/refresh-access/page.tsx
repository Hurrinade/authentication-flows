"use client";

import MessagesPane from "../components/MessagesPane";
import AuthenticationPane from "../components/AuthenticationPane";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../contexts/UserProvider";
import { useMessages } from "../contexts/MessagesProvider";

export default function RefreshAccess() {
  const { setUser, setShowProtected, accessToken, setAccessToken } = useUser();
  const { addMessage } = useMessages();
  const { isLoading } = useQuery({
    queryKey: ["session-user"],
    queryFn: async () => {
      const response = await fetch("api/v1/hybrid-user");
      const data = await response.json();

      if (data.error) {
        setUser(null);
        setShowProtected(false);
        addMessage("Initial Load: " + data.data, "error");
        return data;
      }

      setAccessToken(data.data.accessToken);
      setShowProtected(true);
      setUser({ email: data.data.email });
      addMessage("User is logged in", "success");
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
          >
            Auth App
          </a>
          <h1 className="text-m font-bold text-white">
            Session Authentication
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Pane - Messages */}
          <MessagesPane />

          {/* Right Pane - Authentication */}
          <AuthenticationPane mode="hybrid" />
        </div>
      </div>
    </div>
  );
}
