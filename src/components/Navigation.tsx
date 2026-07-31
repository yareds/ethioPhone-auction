/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { Bell, Search, Shield, Sun, Moon, Sparkles, LogIn, LogOut, ChevronDown, Check, Trash2, Smartphone, X, User, Mail, Phone, UserPlus, MapPin } from "lucide-react";

export default function Navigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const {
    currentUser,
    users,
    switchUser,
    signOut,
    signupUser,
    notifications,
    markNotificationRead,
    clearNotifications,
    searchQuery,
    setSearchQuery,
    selectedBrand,
    setSelectedBrand,
    selectedRegion,
    setSelectedRegion,
    selectedStatus,
    setSelectedStatus,
    isDarkMode,
    toggleTheme
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadNotifs = notifications.filter((n) => n.userId === currentUser.id && !n.isRead);

  const brands = ["All", "Apple", "Samsung", "Google", "Xiaomi"];
  const regions = ["All", "Addis Ababa", "Oromia", "Amhara", "Sidama", "Tigray"];
  const statuses = [
    { value: "all", label: "All Auctions" },
    { value: "live", label: "🔴 Live Now" },
    { value: "upcoming", label: "📅 Upcoming" },
    { value: "ended", label: "🏁 Ended" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("home"); setSelectedBrand(""); setSelectedRegion(""); setSelectedStatus("all"); setSearchQuery(""); }}>
            <div className="bg-yellow-400 dark:bg-yellow-500 text-slate-900 p-2 rounded-xl shadow-md">
              <Smartphone className="h-6 w-6" id="nav-logo-icon" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                EthioPhone <span className="text-yellow-500 font-normal text-sm bg-yellow-100 dark:bg-yellow-950/50 dark:text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-900">Auction</span>
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search phone model, storage, condition..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "home") setActiveTab("home");
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm transition-all"
              id="search-input-field"
            />
          </div>

          {/* Action Tabs & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <nav className="flex items-center gap-1 text-sm font-medium mr-1 sm:mr-3">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "home"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
                id="tab-home-btn"
              >
                Marketplace
              </button>

              {currentUser.id !== "guest" && (
                <button
                  onClick={() => setActiveTab("buyer")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    activeTab === "buyer"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  id="tab-buyer-btn"
                >
                  My Bids
                </button>
              )}

              {currentUser.role === UserRole.ADMIN && (
                <button
                  onClick={() => setActiveTab("seller")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    activeTab === "seller"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  id="tab-seller-btn"
                >
                  Sellers
                </button>
              )}

              {currentUser.role === UserRole.ADMIN && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-2 rounded-lg text-red-600 dark:text-red-400 transition-all flex items-center gap-1 ${
                    activeTab === "admin"
                      ? "bg-red-50 dark:bg-red-950/30 font-semibold"
                      : "hover:bg-red-50/50 dark:hover:bg-red-950/10"
                  }`}
                  id="tab-admin-btn"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              )}
            </nav>

            <button
              onClick={() => setActiveTab("signup")}
              className={`bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-3 py-2 rounded-xl shadow-md gap-1.5 flex items-center transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === "signup" ? "ring-2 ring-yellow-500 ring-offset-2" : ""
              }`}
              id="header-signup-btn"
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign Up to Bid
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              title={isDarkMode ? "Light Theme" : "Dark Theme"}
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-950" />}
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all relative"
                id="notif-bell-btn"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      Notifications
                      {unreadNotifs.length > 0 && (
                        <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
                        id="clear-all-notif"
                      >
                        <Check className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                    {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-xs">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications
                        .filter((n) => n.userId === currentUser.id)
                        .slice(0, 15)
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              !notif.isRead ? "bg-yellow-50/40 dark:bg-yellow-950/10" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Selector & Simulator Switcher */}
            <div className="relative" ref={profileRef}>
              {currentUser.id === "guest" ? (
                <>
                  <button
                    onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-slate-900 font-extrabold text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95"
                    id="sign-in-btn"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Choose a Demo Profile</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Select an account below to sign in instantly.</p>
                      </div>

                      <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="space-y-0.5">
                          {users.filter(u => u.id !== "guest").map((u) => (
                            <button
                              key={u.id}
                              onClick={() => { switchUser(u.id); setShowProfileDropdown(false); }}
                              className="w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <div className="truncate">
                                <span className="block font-bold truncate">{u.name}</span>
                                <span className="text-[9px] font-normal uppercase text-gray-400 dark:text-gray-500">
                                  {u.role.replace("_", " ")} {u.id === "user-admin" ? "(Bole Olympia Plaza)" : ""}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-amber-500/5">
                        <button
                          onClick={() => { setActiveTab("signup"); setShowProfileDropdown(false); }}
                          className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-slate-900 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Sign Up New Account
                        </button>
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-gray-800/20 text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          EthioPhone Auction Demo v1.0
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40"
                    id="profile-dropdown-btn"
                  >
                    <img
                      src={currentUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                      alt={currentUser.name}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 hidden sm:inline max-w-[90px] truncate">
                      {currentUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/70 text-yellow-700 dark:text-yellow-400 uppercase tracking-wider border border-yellow-200 dark:border-yellow-900">
                            {currentUser.role.replace("_", " ")}
                          </span>
                          {currentUser.isVerifiedSeller && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                              VERIFIED SELLER
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-3 py-1.5 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-yellow-500" /> Role Testing Simulator
                        </p>
                        <div className="space-y-0.5">
                          {users.filter(u => u.id !== "guest").map((u) => (
                            <button
                              key={u.id}
                              onClick={() => { switchUser(u.id); setShowProfileDropdown(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-xl transition-all ${
                                currentUser.id === u.id
                                  ? "bg-yellow-500 text-slate-900 font-bold"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                            >
                              <div className="truncate">
                                <span className="block truncate">{u.name}</span>
                                <span className={`text-[9px] font-normal uppercase ${currentUser.id === u.id ? "text-slate-800" : "text-gray-400 dark:text-gray-500"}`}>
                                  {u.role.replace("_", " ")} {u.id === "user-admin" ? "(Bole Olympia Plaza)" : ""}
                                </span>
                              </div>
                              {currentUser.id === u.id && <Check className="h-4.5 w-4.5 stroke-[3px]" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-amber-500/5">
                        <button
                          onClick={() => { setActiveTab("signup"); setShowProfileDropdown(false); }}
                          className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-slate-900 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Sign Up New Account
                        </button>
                      </div>

                      <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-red-500/5">
                        <button
                          onClick={() => { signOut(); setShowProfileDropdown(false); }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Sign Out
                        </button>
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-gray-800/20 text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          EthioPhone Auction Demo v1.0
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4 pt-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search phone model, storage, condition..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "home") setActiveTab("home");
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-xs transition-all"
              id="search-input-field-mobile"
            />
          </div>
        </div>

        {/* Sub-header Filter bar (Only on Home screen) */}
        {activeTab === "home" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/80 py-3 mt-1 overflow-x-auto select-none no-scrollbar">
            
            {/* Brand filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b === "All" ? "" : b)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    (b === "All" && !selectedBrand) || selectedBrand === b
                      ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Region Filter & Status Filter */}
            <div className="flex items-center gap-2">
              
              {/* Region Selector */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">🗺️ All Regions</option>
                {regions.slice(1).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Status Tabs */}
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-0.5 bg-gray-50 dark:bg-gray-800">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatus(s.value)}
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                      selectedStatus === s.value
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

    </header>
  );
}
