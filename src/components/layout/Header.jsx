import React, { useEffect, useState } from "react";
import {
  Menu,
  LayoutDashboard,
  TrendingUp,
  Settings,
  Target,
  Sparkles,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Page info based on route
  const getPageInfo = () => {
    switch (location.pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          subtitle: "Your business analytics overview",
          icon: LayoutDashboard,
          gradient: "from-blue-500 to-cyan-500",
        };
      case "/valuation":
        return {
          title: "Valuation Tool",
          subtitle: "Analyze artist metrics with real-time Spotify data",
          icon: TrendingUp,
          gradient: "from-emerald-500 to-teal-500",
        };
      case "/valuation/detail":
        return {
          title: "Artist Valuation",
          subtitle: "Professional financial analysis & projections",
          icon: Sparkles,
          gradient: "from-purple-500 to-pink-500",
        };
      case "/admin":
        return {
          title: "Admin Panel",
          subtitle: "Manage users and permissions",
          icon: Settings,
          gradient: "from-orange-500 to-red-500",
        };
      default:
        return {
          title: "Catalog Calculator",
          subtitle: "Professional Valuation Suite",
          icon: Target,
          gradient: "from-indigo-500 to-purple-500",
        };
    }
  };

  const pageInfo = getPageInfo();
  const IconComponent = pageInfo.icon;

  const formatTime = () =>
    currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = () =>
    currentTime.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-3">
              <div
                className={`relative p-2.5 rounded-xl bg-gradient-to-br ${pageInfo.gradient} shadow-lg`}
              >
                <IconComponent size={24} className="text-white relative z-10" />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pageInfo.gradient} rounded-xl blur-md opacity-50`}
                />
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {pageInfo.title}
                  {(location.pathname === "/valuation" ||
                    location.pathname === "/dashboard") && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section – Time & Date */}
          <div className="hidden lg:flex flex-col items-end bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatTime()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
