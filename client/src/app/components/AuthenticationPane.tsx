import { useState } from "react";
import { useMessages } from "../contexts/MessagesProvider";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "../contexts/UserProvider";
import Resources from "./Resources";

export default function AuthenticationPane({ mode }: { mode: string }) {
  const { addMessage } = useMessages();
  const { user, setUser, showProtected, setShowProtected } = useUser();
  const [userData, setUserData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const [activeSection, setActiveSection] = useState<
    "register" | "login" | null
  >(null);

  const authMutation = useMutation({
    mutationFn: async (authMethod: "register" | "login") => {
      const response = await fetch(`/api/v1/${authMethod}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          mode: "stateless_simple",
        }),
      });

      if (!response.ok) {
        addMessage(`Failed to ${authMethod}`, "error");
        return { message: "Failed to register" };
      }

      const data = await response.json();
      setShowProtected(true);
      setUser({ email: data.email });
      addMessage(`User ${authMethod} success`, "success");
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "stateless_simple",
        }),
      });
      if (!response.ok) {
        addMessage("Failed to logout", "error");
        return { message: "Failed to logout" };
      }
      setUser(null);
      addMessage("User logged out", "success");
      return;
    },
  });

  const handleLogout = async () => {
    logoutMutation.mutate();
    setShowProtected(false);
    setUserData({ email: "", password: "" });
    setActiveSection(null);
  };

  const handleButtonClick = (section: "register" | "login") => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  if (authMutation.isPending) {
    return <div>Loading...</div>;
  }

  if (authMutation.isError) {
    return <div>Error: {authMutation.error.message}</div>;
  }

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 flex flex-col"
      style={{ height: "calc(100vh - 150px)" }}
    >
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-xl font-semibold text-white">Authentication</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!showProtected ? (
          <div className="space-y-4">
            {/* Buttons */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <button
                onClick={() => handleButtonClick("register")}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === "register"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => handleButtonClick("login")}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === "login"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Login
              </button>
            </div>

            {/* Register Section */}
            {activeSection === "register" && (
              <div className="bg-gray-700/50 rounded-xl p-6 animate-in slide-in-from-top-2 duration-200">
                <h3 className="text-lg font-medium text-white mb-4">
                  Register
                </h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => authMutation.mutate("register")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Login Section */}
            {activeSection === "login" && (
              <div className="bg-gray-700/50 rounded-xl p-6 animate-in slide-in-from-top-2 duration-200">
                <h3 className="text-lg font-medium text-white mb-4">Login</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => authMutation.mutate("login")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Logged In State */
          <>
            <div className="space-y-6">
              {user ? (
                <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-green-100 mb-4">
                    Welcome Back!
                  </h3>
                  <div className="space-y-2 text-green-100">
                    <p>
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <h3 className="text-lg font-medium text-red-100 mb-4">
                  You are not logged in
                </h3>
              )}
            </div>

            {/* Resources Section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Your Resources
              </h4>
              <Resources />
            </div>

            {/* Logout Section */}
            <div className="pt-4 border-t border-gray-700 flex gap-4">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout/Back
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
