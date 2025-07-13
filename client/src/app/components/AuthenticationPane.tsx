import { useState } from "react";
import { useMessages } from "../contexts/MessagesProvider";

export default function AuthenticationPane({ mode }: { mode: string }) {
  const { addMessage } = useMessages();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "register" | "login" | null
  >(null);

  const handleRegister = async () => {
    // TODO: Implement register logic
  };

  const handleLogin = async () => {
    // TODO: Implement login logic
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserData(null);
    setActiveSection(null);
  };

  const handleButtonClick = (section: "register" | "login") => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 flex flex-col"
      style={{ height: "calc(100vh - 150px)" }}
    >
      <h2 className="text-xl font-semibold text-white mb-6 flex-shrink-0">
        Authentication
      </h2>

      <div className="flex-1 overflow-y-auto">
        {!isLoggedIn ? (
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
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleRegister}
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
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleLogin}
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
              {userData && (
                <div className="space-y-2 text-green-100">
                  <p>
                    <span className="font-medium">Name:</span> {userData.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {userData.email}
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
