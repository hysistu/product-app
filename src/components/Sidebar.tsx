"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onCollapse }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const navigation = [
    {
      name: "Paneli",
      href: "/dashboard",
      icon: "📊",
      description: "Pamje dhe analiza",
    },
    {
      name: "Fletushka të Produkteve",
      href: "/flyers",
      icon: "📋",
      description: "Menaxho fletushka të produkteve",
    },
    {
      name: "Krijo Fletushkë",
      href: "/flyers/create",
      icon: "➕",
      description: "Krijo fletushkë të re",
    },
    {
      name: "Produkte",
      href: "/products",
      icon: "🛠️",
      description: "Menaxho produkte",
    },
    {
      name: "Kategori",
      href: "/categories",
      icon: "📁",
      description: "Kategori të produkteve",
    },
    {
      name: "Marka",
      href: "/brands",
      icon: "🏷️",
      description: "Marka të produkteve",
    },
    {
      name: "Përdorues",
      href: "/users",
      icon: "👥",
      description: "Menaxhimi i përdoruesve",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapse?.(newCollapsedState);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function in AuthContext will handle redirecting to login
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: manually redirect if logout fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">P</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Aplikacioni i Produkteve
              </h1>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Zgjero anësoren" : "Mbylle anësoren"}
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
                d={
                  isCollapsed
                    ? "M13 7l5 5m0 0l-5 5m5-5H6"
                    : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                }
              />
            </svg>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${
                    isActive(item.href)
                      ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-xl mr-3 flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div
                      className={`text-xs ${
                        isActive(item.href)
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 px-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-sm font-medium">
                {user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || "U"}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
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
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
