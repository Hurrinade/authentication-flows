import { useState } from "react";
import { useMessages } from "../contexts/MessagesProvider";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "../contexts/UserProvider";

export default function AuthenticationPane({ mode }: { mode: string }) {
  const { addMessage } = useMessages();
  const { user, setUser } = useUser();
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
  const [selectedMode, setSelectedMode] = useState(mode);

  const authMutation = useMutation({
    mutationFn: async (authMethod: "register" | "login") => {
      const response = await fetch(
        `http://localhost:3000/api/v1/${authMethod}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            mode: selectedMode,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      setUser({ email: data.email });
      return data;
    },
  });

  const handleLogout = async () => {
    setUser(null);
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

  const handleModeChange = (newMode: string) => {
    setSelectedMode(newMode);
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

        {/* Mode Dropdown */}
        <div className="relative">
          <select
            value={selectedMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="stateless_simple">Stateless Simple</option>
            <option value="hybrid">Hybrid</option>
            <option value="statefull">Statefull</option>
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!user ? (
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
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
              <h3 className="text-lg font-medium text-green-100 mb-4">
                Welcome Back!
              </h3>
              {user && (
                <div className="space-y-2 text-green-100">
                  <p>
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
