"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showSidebar = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (!showSidebar) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onCollapse={handleSidebarCollapse}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-0"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
