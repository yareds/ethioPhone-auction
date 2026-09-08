/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { TRIAL_MODE } from "../config";
import { Bell, Search, Shield, Sun, Moon, Sparkles, LogIn, LogOut, ChevronDown, Check, Trash2, Smartphone, X, User, Mail, Phone, UserPlus, MapPin, Gavel, Store, ShoppingBag } from "lucide-react";
import { BrandLogo, PhoneLetterO } from "./Logo";
import AdminLoginModal from "./AdminLoginModal";
import SignupModal from "./SignupModal";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Navigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const {
    currentUser,
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
    toggleTheme,
    isPhoneSignedIn,
    showAdminLoginModal,
    setShowAdminLoginModal,
    showBidderLoginModal,
    setShowBidderLoginModal,
    bidderModalContext,
    setBidderModalContext
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleDirectGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Direct Google sign-in note:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setBidderModalContext("Sign in with Google to place bids, save favorites, and track live auctions");
        setShowBidderLoginModal(true);
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const isAdmin = currentUser.role === UserRole.ADMIN && currentUser.id !== "guest";

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
  const statuses = [
    { value: "all", label: "All Auctions" },
    { value: "live", label: "Live Now" },
    { value: "upcoming", label: "Upcoming" },
    { value: "ended", label: "Ended" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)]/98 dark:bg-[var(--color-ink)]/98 backdrop-blur-md transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <BrandLogo
            onClick={() => {
              setActiveTab("home");
              setSelectedBrand("");
              setSelectedRegion("");
              setSelectedStatus("all");
              setSearchQuery("");
            }}
          />

          {/* Quick Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--color-ink)]/40 dark:text-[var(--color-paper)]/40" />
            </div>
            <input
              type="text"
              placeholder="Search phone model, storage, condition..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "home") setActiveTab("home");
              }}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] placeholder-[var(--color-ink)]/40 dark:placeholder-[var(--color-paper)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] text-sm transition-all"
              id="search-input-field"
            />
          </div>

          {/* Action Tabs & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium mr-1 sm:mr-3">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "home"
                    ? "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] font-semibold"
                    : "text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)]"
                }`}
                id="tab-home-btn"
              >
                Marketplace
              </button>

              <button
                onClick={() => {
                  if (currentUser.id === "guest") {
                    setBidderModalContext("Sign in with Google to view and track your active bids");
                    setShowBidderLoginModal(true);
                  } else {
                    setActiveTab("buyer");
                  }
                }}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "buyer"
                    ? "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] font-semibold"
                    : "text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)]"
                }`}
                id="tab-buyer-btn"
              >
                My Bids
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab("seller")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    activeTab === "seller"
                      ? "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] font-semibold"
                      : "text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)]"
                  }`}
                  id="tab-seller-btn"
                >
                  Sellers
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-2 rounded-lg text-[var(--color-danger)] transition-all flex items-center gap-1 ${
                    activeTab === "admin"
                      ? "bg-[var(--color-danger)]/10 font-semibold"
                      : "hover:bg-[var(--color-danger)]/5"
                  }`}
                  id="tab-admin-btn"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              )}
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--color-ink)] dark:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] rounded-xl transition-all"
              title={isDarkMode ? "Light Theme" : "Dark Theme"}
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-[var(--color-gold)]" /> : <Moon className="h-5 w-5 text-[var(--color-ink)]" />}
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                className="p-2 text-[var(--color-ink)] dark:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] rounded-xl transition-all relative"
                id="notif-bell-btn"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-white ring-2 ring-[var(--color-paper)] dark:ring-[var(--color-ink)] animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--color-ink)] dark:text-[var(--color-paper)] flex items-center gap-1.5">
                      Notifications
                      {unreadNotifs.length > 0 && (
                        <span className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-xs px-2 py-0.5 rounded-full">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-[var(--color-gold)] hover:underline flex items-center gap-1"
                        id="clear-all-notif"
                      >
                        <Check className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-paper-soft)] dark:divide-[var(--color-ink-soft)]">
                    {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                      <div className="p-8 text-center text-[var(--color-ink)]/50 dark:text-[var(--color-paper)]/50">
                        <Bell className="h-8 w-8 mx-auto text-[var(--color-ink)]/30 dark:text-[var(--color-paper)]/30 mb-2" />
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
                            className={`p-4 transition-colors cursor-pointer hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] ${
                              !notif.isRead ? "bg-[var(--color-gold-soft)]/15 dark:bg-[var(--color-gold)]/10" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-xs text-[var(--color-ink)] dark:text-[var(--color-paper)]">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-[var(--color-ink)]/40 dark:text-[var(--color-paper)]/40">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Selector & Auth Action Controls */}
            <div className="flex items-center gap-2" ref={profileRef}>
              {currentUser.id === "guest" ? (
                <>
                  {/* Admin Portal Button */}
                  <button
                    onClick={() => setShowAdminLoginModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    id="nav-admin-login-btn"
                    title="Sign In as Admin"
                  >
                    <Shield className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Admin</span>
                  </button>

                  {/* Google Sign In Button */}
                  <button
                    onClick={handleDirectGoogleSignIn}
                    disabled={isGoogleSigningIn}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white dark:bg-[var(--color-ink-soft)] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 font-bold text-xs transition-all shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-60 shrink-0"
                    id="nav-google-signin-btn"
                    title="Sign in with Google"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="hidden sm:inline">{isGoogleSigningIn ? "Connecting..." : "Google Sign In"}</span>
                    <span className="sm:hidden">{isGoogleSigningIn ? "..." : "Google"}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                      className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper-soft)]/40 dark:bg-[var(--color-ink-soft)]/40 cursor-pointer"
                      id="profile-dropdown-btn"
                    >
                      <img
                        src={currentUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                        alt={currentUser.name}
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                      <span className="text-xs font-semibold text-[var(--color-ink)] dark:text-[var(--color-paper)] hidden sm:inline max-w-[90px] truncate">
                        {currentUser.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="h-3 w-3 text-[var(--color-ink)]/50 dark:text-[var(--color-paper)]/50" />
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-64 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-4 bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)]/50 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
                          <p className="text-xs font-medium text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60">Signed in as</p>
                          <p className="font-bold text-sm text-[var(--color-ink)] dark:text-[var(--color-paper)] truncate">{currentUser.name}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              isAdmin
                                ? "bg-[var(--color-gold-soft)]/20 text-[var(--color-gold)] border-[var(--color-gold)]/30"
                                : "bg-[var(--color-paper-soft)] text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 border-[var(--color-paper-soft)]"
                            }`}>
                              {isAdmin ? "ADMIN" : "BUYER / BIDDER"}
                            </span>
                            {currentUser.isVerifiedSeller && (
                              <span className="seal">
                                VERIFIED SELLER
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Account Menu Options */}
                        <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] space-y-1">
                          <button
                            onClick={() => { setActiveTab("buyer"); setShowProfileDropdown(false); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-ink)] dark:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] flex items-center gap-2 transition-all cursor-pointer"
                            id="profile-my-bids-btn"
                          >
                            <Gavel className="h-4 w-4 text-[var(--color-gold)]" />
                            <span>My Bids & Auctions</span>
                          </button>
                        </div>

                        {isAdmin && (
                          <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
                            <button
                              onClick={() => { setActiveTab("admin"); setShowProfileDropdown(false); }}
                              className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              id="profile-admin-workspace-btn"
                            >
                              <Shield className="h-3.5 w-3.5" /> Admin Workspace
                            </button>
                          </div>
                        )}

                        <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-danger)]/5">
                          <button
                            onClick={() => { signOut(); setShowProfileDropdown(false); }}
                            className="w-full bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" /> Sign Out
                          </button>
                        </div>

                        <div className="p-2 bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)]/20 text-center">
                          <p className="text-[10px] text-[var(--color-ink)]/40 dark:text-[var(--color-paper)]/40 font-medium">
                            YONIMobile Auction v1.0
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--color-ink)]/40 dark:text-[var(--color-paper)]/40" />
            </div>
            <input
              type="text"
              placeholder="Search phone model, storage, condition..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "home") setActiveTab("home");
              }}
              className="block w-full pl-10 pr-9 py-2 border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] placeholder-[var(--color-ink)]/40 dark:placeholder-[var(--color-paper)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] text-xs transition-all"
              id="search-input-field-mobile"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-header Filter bar (Only on Home screen) */}
        {activeTab === "home" && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] py-2.5 mt-1 overflow-x-auto select-none no-scrollbar">
            
            {/* Brand filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b === "All" ? "" : b)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    (b === "All" && !selectedBrand) || selectedBrand === b
                      ? "bg-[var(--color-gold)] text-[var(--color-paper)] shadow-sm"
                      : "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:bg-[var(--color-paper-soft)]/80 dark:hover:bg-[var(--color-ink-soft)]/80"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Tabs */}
              <div className="flex border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-lg overflow-hidden p-0.5 bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)]">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatus(s.value)}
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                      selectedStatus === s.value
                        ? "bg-[var(--color-paper)] dark:bg-[var(--color-ink)] text-[var(--color-ink)] dark:text-[var(--color-paper)] shadow-sm"
                        : "text-[var(--color-ink)]/50 dark:text-[var(--color-paper)]/50 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
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

      {/* Mobile Sticky Bottom Navigation Bar (thumb-friendly, min 44px touch targets) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-paper)]/95 dark:bg-[var(--color-ink)]/95 backdrop-blur-xl border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] px-2 py-1 flex items-center justify-around shadow-2xl safe-area-inset-bottom"
        id="mobile-bottom-nav"
      >
        {/* Marketplace */}
        <button
          onClick={() => {
            setActiveTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
            activeTab === "home"
              ? "text-[var(--color-gold)] font-bold"
              : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
          }`}
          id="mobile-nav-marketplace-btn"
        >
          <Store className={`h-5 w-5 mb-0.5 ${activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] leading-tight">Market</span>
        </button>

        {/* My Bids */}
        <button
          onClick={() => {
            if (currentUser.id === "guest") {
              setBidderModalContext("Sign in with Google to view and track your active bids");
              setShowBidderLoginModal(true);
            } else {
              setActiveTab("buyer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "buyer"
              ? "text-[var(--color-gold)] font-bold"
              : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
          }`}
          id="mobile-nav-bids-btn"
        >
          <Gavel className={`h-5 w-5 mb-0.5 ${activeTab === "buyer" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] leading-tight">My Bids</span>
        </button>

        {/* Sellers (Admin only) */}
        {isAdmin && (
          <button
            onClick={() => {
              setActiveTab("seller");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
              activeTab === "seller"
                ? "text-[var(--color-gold)] font-bold"
                : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
            }`}
            id="mobile-nav-sellers-btn"
          >
            <ShoppingBag className={`h-5 w-5 mb-0.5 ${activeTab === "seller" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] leading-tight">Sellers</span>
          </button>
        )}

        {/* Notifications / Alerts */}
        <button
          onClick={() => {
            setShowNotifDropdown((prev) => !prev);
            setShowProfileDropdown(false);
          }}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
            showNotifDropdown
              ? "text-[var(--color-gold)] font-bold"
              : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
          }`}
          id="mobile-nav-alerts-btn"
          aria-label="Toggle notifications"
        >
          <div className="relative">
            <Bell className="h-5 w-5 mb-0.5 stroke-[1.75]" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[8px] font-bold text-white">
                {unreadNotifs.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">Alerts</span>
        </button>

        {/* Admin Workspace (Admin only) or Admin Sign In (Guest only) */}
        {isAdmin ? (
          <button
            onClick={() => {
              setActiveTab("admin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
              activeTab === "admin"
                ? "text-[var(--color-danger)] font-bold"
                : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-danger)]"
            }`}
            id="mobile-nav-admin-btn"
          >
            <Shield className={`h-5 w-5 mb-0.5 ${activeTab === "admin" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] leading-tight">Admin</span>
          </button>
        ) : currentUser.id === "guest" ? (
          <button
            onClick={() => setShowAdminLoginModal(true)}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl text-red-600 dark:text-red-400 font-semibold transition-all"
            id="mobile-nav-admin-btn"
          >
            <Shield className="h-5 w-5 mb-0.5 stroke-[1.75]" />
            <span className="text-[10px] leading-tight">Admin</span>
          </button>
        ) : null}

        {currentUser.id !== "guest" ? (
          <button
            onClick={() => {
              setShowProfileDropdown((prev) => !prev);
              setShowNotifDropdown(false);
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
              showProfileDropdown
                ? "text-[var(--color-gold)] font-bold"
                : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-gold)]"
            }`}
            id="mobile-nav-profile-btn"
          >
            <User className="h-5 w-5 mb-0.5 stroke-[1.75]" />
            <span className="text-[10px] leading-tight">Profile</span>
          </button>
        ) : (
          <button
            onClick={handleDirectGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl text-gray-800 dark:text-gray-200 font-bold transition-all cursor-pointer disabled:opacity-50"
            id="mobile-nav-google-btn"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5 mb-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="text-[10px] leading-tight">{isGoogleSigningIn ? "..." : "Google"}</span>
          </button>
        )}
      </nav>

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={() => setActiveTab("admin")}
      />

      <SignupModal
        isOpen={showBidderLoginModal}
        onClose={() => setShowBidderLoginModal(false)}
        context={bidderModalContext || "Sign in with Google to place bids, save favorites, and track live auctions"}
      />

    </header>
  );
}
