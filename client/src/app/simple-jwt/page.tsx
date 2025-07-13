"use client";

import MessagesPane from "../components/MessagesPane";
import AuthenticationPane from "../components/AuthenticationPane";

export default function SimpleJWT() {
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
