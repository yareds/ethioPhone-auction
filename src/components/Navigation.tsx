/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { TRIAL_MODE } from "../config";
import { Bell, Search, Shield, Sun, Moon, Sparkles, LogIn, LogOut, ChevronDown, Check, Trash2, Smartphone, X, User, Mail, Phone, UserPlus, MapPin } from "lucide-react";
import { BrandLogo, PhoneLetterO } from "./Logo";

export default function Navigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const {
    currentUser,
    signOut,
    signInWithGoogle,
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
    isGoogleLinked,
    linkGoogleAccount
  } = useApp();

  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        alert(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLinkGoogleFromNav = async () => {
    setLinkingGoogle(true);
    const res = await linkGoogleAccount();
    setLinkingGoogle(false);
    if (res.success) {
      alert("Google account successfully linked as a backup sign-in method!");
      setShowProfileDropdown(false);
    } else {
      alert(res.error || "Failed to link Google account.");
    }
  };

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
  const statuses = [
    { value: "all", label: "All Auctions" },
    { value: "live", label: "Live Now" },
    { value: "upcoming", label: "Upcoming" },
    { value: "ended", label: "Ended" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)]/95 dark:bg-[var(--color-ink)]/95 backdrop-blur-md transition-colors duration-200">
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
            
            <nav className="flex items-center gap-1 text-sm font-medium mr-1 sm:mr-3">
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

              {currentUser.id !== "guest" && (
                <button
                  onClick={() => setActiveTab("buyer")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    activeTab === "buyer"
                      ? "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] font-semibold"
                      : "text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)]"
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
                      ? "bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] font-semibold"
                      : "text-[var(--color-ink)]/70 dark:text-[var(--color-paper)]/70 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)]"
                  }`}
                  id="tab-seller-btn"
                >
                  Sellers
                </button>
              )}

              {currentUser.role === UserRole.ADMIN && (
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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

            {/* Profile Selector & Account Menu */}
            <div className="relative" ref={profileRef}>
              {currentUser.id === "guest" ? (
                TRIAL_MODE ? (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]/80 text-[var(--color-ink)] dark:text-[var(--color-paper)] font-bold text-xs transition-all border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] disabled:opacity-50"
                    id="admin-sign-in-btn"
                    title="Admin Portal Sign In"
                  >
                    <Shield className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                    <span>{signingIn ? "Signing In..." : "Admin"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-ink)] hover:bg-[var(--color-ink-soft)] text-white dark:bg-[var(--color-gold)] dark:hover:bg-[var(--color-gold-soft)] dark:text-[var(--color-ink)] font-bold text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    id="sign-in-btn"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{signingIn ? "Signing In..." : "Sign In with Google"}</span>
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper-soft)]/40 dark:bg-[var(--color-ink-soft)]/40"
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
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-4 bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)]/50 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
                        <p className="text-xs font-medium text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60">Signed in as</p>
                        <p className="font-bold text-sm text-[var(--color-ink)] dark:text-[var(--color-paper)] truncate">{currentUser.name}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-gold-soft)]/20 text-[var(--color-gold)] uppercase tracking-wider border border-[var(--color-gold)]/30">
                            {currentUser.role.replace("_", " ")}
                          </span>
                          {currentUser.isVerifiedSeller && (
                            <span className="seal">
                              VERIFIED SELLER
                            </span>
                          )}
                        </div>
                      </div>

                      {isPhoneSignedIn && !isGoogleLinked && (
                        <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-gold)]/10">
                          <button
                            onClick={handleLinkGoogleFromNav}
                            disabled={linkingGoogle}
                            className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                            id="nav-link-google-btn"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>{linkingGoogle ? "Linking..." : "Add Google Backup Sign-In"}</span>
                          </button>
                        </div>
                      )}

                      <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-danger)]/5">
                        <button
                          onClick={() => { signOut(); setShowProfileDropdown(false); }}
                          className="w-full bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
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
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4 pt-1">
          <div className="relative">
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
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-[var(--color-paper)] placeholder-[var(--color-ink)]/40 dark:placeholder-[var(--color-paper)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] text-xs transition-all"
              id="search-input-field-mobile"
            />
          </div>
        </div>

        {/* Sub-header Filter bar (Only on Home screen) */}
        {activeTab === "home" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] py-3 mt-1 overflow-x-auto select-none no-scrollbar">
            
            {/* Brand filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b === "All" ? "" : b)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
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
            <div className="flex items-center gap-2">
              {/* Status Tabs */}
              <div className="flex border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-lg overflow-hidden p-0.5 bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)]">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatus(s.value)}
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${
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

    </header>
  );
}
