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
    setShowAdminLoginModal
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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
                <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
                <button
                  onClick={() => setShowAdminLoginModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]/80 text-[var(--color-ink)] dark:text-[var(--color-paper)] font-bold text-xs transition-all border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] cursor-pointer"
                  id="user-sign-in-btn"
                  title="Sign In"
                >
                  <LogIn className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                  <span>Sign In</span>
                </button>
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
                    <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-64 rounded-2xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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

                      {isAdmin && (
                        <div className="p-2 border-b border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
                          <button
                            onClick={() => { setActiveTab("admin"); setShowProfileDropdown(false); }}
                            className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            id="profile-admin-workspace-btn"
                          >
                            <Shield className="h-3.5 w-3.5" /> Admin Workspace
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
        {currentUser.id !== "guest" ? (
          <button
            onClick={() => {
              setActiveTab("buyer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
              activeTab === "buyer"
                ? "text-[var(--color-gold)] font-bold"
                : "text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)]"
            }`}
            id="mobile-nav-bids-btn"
          >
            <Gavel className={`h-5 w-5 mb-0.5 ${activeTab === "buyer" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] leading-tight">My Bids</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveTab("home");
              const el = document.getElementById("search-input-field-mobile");
              if (el) el.focus();
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-ink)] dark:hover:text-[var(--color-paper)] transition-all"
            id="mobile-nav-explore-btn"
          >
            <Search className="h-5 w-5 mb-0.5 stroke-[1.75]" />
            <span className="text-[10px] leading-tight">Search</span>
          </button>
        )}

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

        {/* Admin or Profile or Sign In */}
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
        ) : currentUser.id !== "guest" ? (
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
            onClick={() => setShowAdminLoginModal(true)}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl text-[var(--color-ink)]/60 dark:text-[var(--color-paper)]/60 hover:text-[var(--color-gold)] transition-all"
            id="mobile-nav-login-btn"
          >
            <LogIn className="h-5 w-5 mb-0.5 stroke-[1.75]" />
            <span className="text-[10px] leading-tight">Sign In</span>
          </button>
        )}
      </nav>

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={() => setActiveTab("admin")}
      />

    </header>
  );
}
