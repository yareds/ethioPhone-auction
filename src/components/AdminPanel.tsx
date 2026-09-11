/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole, Report, ShopProfile, PhoneListing, AuctionStatus } from "../types";
import {
  Shield,
  Users,
  ShoppingBag,
  ShieldAlert,
  Check,
  Ban,
  X,
  Sparkles,
  TrendingUp,
  AlertOctagon,
  ArrowLeft,
  Clock,
  Calendar,
  Search,
  ExternalLink,
  Zap,
  Hourglass,
  AlertCircle,
  Gavel
} from "lucide-react";
import EditBidTimeFrameModal from "./EditBidTimeFrameModal";
import ListingDetail from "./ListingDetail";

export default function AdminPanel() {
  const {
    currentUser,
    setActiveTab: setGlobalActiveTab,
    setShowAdminLoginModal,
    users,
    shops,
    listings,
    reports,
    verifySeller,
    verifyShop,
    resolveReport,
    blockUser,
    updateListing
  } = useApp();

  const [activeTab, setActiveTab] = useState<"stats" | "auctions" | "users" | "shops" | "reports">("stats");
  const [selectedListingForTimeFrame, setSelectedListingForTimeFrame] = useState<PhoneListing | null>(null);
  const [selectedListingForDetail, setSelectedListingForDetail] = useState<PhoneListing | null>(null);
  const [auctionSearchTerm, setAuctionSearchTerm] = useState("");
  const [auctionStatusFilter, setAuctionStatusFilter] = useState<"ALL" | AuctionStatus>("ALL");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (currentUser.role !== UserRole.ADMIN || currentUser.id === "guest") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-in fade-in duration-200">
        <div className="h-16 w-16 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[var(--color-danger)]/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] dark:text-white">Admin Clearance Required</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          This portal is strictly restricted to the authenticated platform administrator.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setGlobalActiveTab("home")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]/80 text-[var(--color-ink)] dark:text-[var(--color-paper)] font-bold text-xs rounded-xl transition-all border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] cursor-pointer"
            id="admin-unauthorized-return-home-btn"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Marketplace</span>
          </button>
          {currentUser.id === "guest" && (
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              id="admin-unauthorized-login-btn"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Sign In</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // High level metrics
  const activeUsersCount = users.filter((u) => !u.isBlocked).length;
  const verifiedShopsCount = shops.filter((s) => s.isVerified).length;
  const unverifiedShops = shops.filter((s) => !s.isVerified);
  const pendingReports = reports.filter((r) => r.status === "pending");

  const liveAuctionsCount = listings.filter((l) => l.status === AuctionStatus.LIVE).length;
  const upcomingAuctionsCount = listings.filter((l) => l.status === AuctionStatus.UPCOMING).length;
  const endedAuctionsCount = listings.filter((l) => l.status === AuctionStatus.ENDED || l.status === AuctionStatus.COMPLETED).length;

  const filteredAuctions = listings.filter((l) => {
    const term = auctionSearchTerm.toLowerCase();
    const matchesSearch =
      l.brand.toLowerCase().includes(term) ||
      l.model.toLowerCase().includes(term) ||
      l.imei.toLowerCase().includes(term);
    const matchesStatus =
      auctionStatusFilter === "ALL" || l.status === auctionStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickExtendListing = (listing: PhoneListing, hoursToAdd: number) => {
    const now = Date.now();
    const currentEnd = new Date(listing.endTime).getTime();
    const baseTime = isNaN(currentEnd) || currentEnd < now ? now : currentEnd;
    const newEnd = new Date(baseTime + hoursToAdd * 60 * 60 * 1000).toISOString();

    updateListing(listing.id, {
      endTime: newEnd,
      status: listing.status === AuctionStatus.ENDED ? AuctionStatus.LIVE : listing.status
    });

    setActionFeedback(`Extended ${listing.brand} ${listing.model} by ${hoursToAdd} hour${hoursToAdd > 1 ? "s" : ""}!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const getListingTimeStatus = (listing: PhoneListing) => {
    const now = Date.now();
    const start = new Date(listing.startTime).getTime();
    const end = new Date(listing.endTime).getTime();

    if (listing.status === AuctionStatus.COMPLETED) {
      return { label: "Pickup Completed", badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
    }

    if (now < start) {
      const diff = start - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const text = hours > 24 ? `Starts in ${Math.ceil(hours / 24)}d` : `Starts in ${hours}h ${mins}m`;
      return { label: text, badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" };
    }

    if (now >= start && now < end) {
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      const text = days > 0 ? `${days}d ${remHours}h left` : `${hours}h ${mins}m left`;
      return { label: text, badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold" };
    }

    const diffAgo = now - end;
    const hoursAgo = Math.floor(diffAgo / (1000 * 60 * 60));
    const text = hoursAgo > 24 ? `Ended ${Math.floor(hoursAgo / 24)}d ago` : `Ended ${hoursAgo}h ago`;
    return { label: text, badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Title bar banner */}
      <div className="bg-[var(--color-ink)] text-[var(--color-paper)] rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative">
          <div className="bg-[var(--color-gold)]/20 p-3 rounded-2xl">
            <Shield className="h-8 w-8 text-[var(--color-gold-soft)]" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-2xl tracking-tight text-[var(--color-paper)]">YONIMobile Admin Workspace</h1>
            <p className="text-xs text-[var(--color-paper)]/70 mt-1">Platform Moderator clearance. Review and approve sellers, inspect reported IMEI clones, and monitor server operations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--color-paper)] rounded-2xl p-2 border border-[var(--color-paper-soft)] space-y-1">
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "stats"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5" /> Platform Analytics
              </span>
            </button>

            <button
              onClick={() => setActiveTab("auctions")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "auctions"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
              id="admin-tab-auctions-btn"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5" /> Auction Time Frames ({listings.length})
              </span>
              {liveAuctionsCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {liveAuctionsCount} Live
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5" /> Manage Users ({users.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("shops")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "shops"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5" /> Verify Shops
              </span>
              {unverifiedShops.length > 0 && (
                <span className="bg-[var(--color-gold-soft)] text-[var(--color-ink)] text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {unverifiedShops.length} Request
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "reports"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" /> Community Reports
              </span>
              {pendingReports.length > 0 && (
                <span className="bg-[var(--color-danger)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingReports.length} Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT PANEL */}
        <div className="lg:col-span-9 bg-[var(--color-paper)] rounded-3xl border border-[var(--color-paper-soft)] p-6">
          
          {/* TAB: PLATFORM ANALYTICS */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">Addis Ababa Auction Metrics</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[var(--color-paper-soft)]/50 p-4 rounded-2xl border border-[var(--color-paper-soft)]">
                  <p className="text-[10px] text-[var(--color-ink-soft)]/60 font-semibold uppercase">Total Users</p>
                  <p className="text-2xl font-display font-semibold text-[var(--color-ink)] mt-1">{users.length}</p>
                </div>

                <div className="bg-[var(--color-paper-soft)]/50 p-4 rounded-2xl border border-[var(--color-paper-soft)]">
                  <p className="text-[10px] text-[var(--color-ink-soft)]/60 font-semibold uppercase">Registered Shops</p>
                  <p className="text-2xl font-display font-semibold text-[var(--color-ink)] mt-1">{shops.length}</p>
                </div>

                <div className="bg-[var(--color-paper-soft)]/50 p-4 rounded-2xl border border-[var(--color-paper-soft)]">
                  <p className="text-[10px] text-[var(--color-ink-soft)]/60 font-semibold uppercase">Active Auctions</p>
                  <p className="text-2xl font-display font-semibold text-[var(--color-ink)] mt-1">
                    {listings.filter((l) => l.status === "live").length}
                  </p>
                </div>

                <div className="bg-[var(--color-paper-soft)]/50 p-4 rounded-2xl border border-[var(--color-paper-soft)]">
                  <p className="text-[10px] text-[var(--color-ink-soft)]/60 font-semibold uppercase">Reports Flagged</p>
                  <p className="text-2xl font-display font-semibold text-[var(--color-danger)] mt-1">{reports.length}</p>
                </div>
              </div>

              {/* Fraud Detection Analysis mock */}
              <div className="bg-[var(--color-ink)] text-[var(--color-paper)] p-6 rounded-3xl border border-[var(--color-paper-soft)]">
                <h4 className="text-[var(--color-gold-soft)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4" /> System AI Security Status (Anti-Fraud Guard)
                </h4>
                <ul className="text-xs space-y-2.5 leading-relaxed font-sans mt-3 text-[var(--color-paper)]/80">
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-[var(--color-verified)] shrink-0 mt-0.5" />
                    <span><strong>IMEI validation engine:</strong> ACTIVE. Restricting listings to 15 numeric digits.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-[var(--color-verified)] shrink-0 mt-0.5" />
                    <span><strong>Duplicate listings check:</strong> ACTIVE. Blocked 3 duplicate IMEIs in the last 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-[var(--color-verified)] shrink-0 mt-0.5" />
                    <span><strong>Verified physical shops:</strong> 100% of shop sellers verified against local registry papers.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: AUCTIONS & BID TIME FRAMES */}
          {activeTab === "auctions" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">
                    Auction Schedules & Time Frames
                  </h3>
                  <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                    Adjust bidding windows, extend durations for active auctions, or reschedule smartphones.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    {liveAuctionsCount} Live
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800">
                    {upcomingAuctionsCount} Upcoming
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-700">
                    {endedAuctionsCount} Ended
                  </span>
                </div>
              </div>

              {actionFeedback && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl p-3 flex items-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">{actionFeedback}</span>
                </div>
              )}

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--color-paper-soft)]/40 p-3 rounded-2xl border border-[var(--color-paper-soft)]">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-soft)]" />
                  <input
                    type="text"
                    value={auctionSearchTerm}
                    onChange={(e) => setAuctionSearchTerm(e.target.value)}
                    placeholder="Search auctions by brand, model, or IMEI..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-paper)] border border-[var(--color-paper-soft)] rounded-xl text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                    id="admin-search-auctions-input"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setAuctionStatusFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      auctionStatusFilter === "ALL"
                        ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                        : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
                    }`}
                  >
                    All ({listings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuctionStatusFilter(AuctionStatus.LIVE)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      auctionStatusFilter === AuctionStatus.LIVE
                        ? "bg-red-500 text-white font-bold shadow-sm"
                        : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
                    }`}
                  >
                    Live ({liveAuctionsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuctionStatusFilter(AuctionStatus.UPCOMING)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      auctionStatusFilter === AuctionStatus.UPCOMING
                        ? "bg-blue-600 text-white font-bold shadow-sm"
                        : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
                    }`}
                  >
                    Upcoming ({upcomingAuctionsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuctionStatusFilter(AuctionStatus.ENDED)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      auctionStatusFilter === AuctionStatus.ENDED
                        ? "bg-gray-700 text-white font-bold shadow-sm"
                        : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
                    }`}
                  >
                    Ended ({endedAuctionsCount})
                  </button>
                </div>
              </div>

              {/* Auctions List */}
              {filteredAuctions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--color-paper-soft)] rounded-2xl">
                  <Clock className="h-8 w-8 text-[var(--color-ink-soft)]/40 mx-auto mb-2" />
                  <p className="text-xs text-[var(--color-ink-soft)]">No auctions match your search or filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAuctions.map((listing) => {
                    const timeStatus = getListingTimeStatus(listing);
                    const startDateFormatted = new Date(listing.startTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const endDateFormatted = new Date(listing.endTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={listing.id}
                        className="bg-[var(--color-paper)] border border-[var(--color-paper-soft)] hover:border-[var(--color-gold)]/50 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                      >
                        {/* Device Info */}
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <img
                            src={listing.images[0] || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80"}
                            alt={listing.model}
                            className="h-14 w-14 rounded-xl object-cover border border-[var(--color-paper-soft)] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">
                                {listing.brand}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                listing.status === AuctionStatus.LIVE
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                  : listing.status === AuctionStatus.UPCOMING
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {listing.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[var(--color-ink)] truncate">
                              {listing.model}
                            </h4>
                            <p className="text-[11px] text-[var(--color-ink-soft)]">
                              {listing.storage} • {listing.condition} • IMEI: {listing.imei}
                            </p>
                          </div>
                        </div>

                        {/* Bid Price */}
                        <div className="text-left md:text-center min-w-[120px]">
                          <p className="text-[10px] uppercase font-bold text-[var(--color-ink-soft)]/60">Current Bid</p>
                          <p className="text-sm font-extrabold text-[var(--color-ink)] font-mono">
                            ETB {listing.currentBid.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[var(--color-ink-soft)]">
                            Start: ETB {listing.startingBid.toLocaleString()}
                          </p>
                        </div>

                        {/* Schedule & Time Window */}
                        <div className="min-w-[220px] bg-[var(--color-paper-soft)]/40 p-2.5 rounded-xl border border-[var(--color-paper-soft)] text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-[var(--color-ink-soft)]/70 flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-[var(--color-gold)]" /> Window:
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md ${timeStatus.badgeClass}`}>
                              {timeStatus.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--color-ink)] font-medium">
                            <span className="text-[var(--color-ink-soft)]">From:</span> {startDateFormatted}
                          </div>
                          <div className="text-[11px] text-[var(--color-ink)] font-medium">
                            <span className="text-[var(--color-ink-soft)]">To:</span> {endDateFormatted}
                          </div>
                        </div>

                        {/* Admin Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                          {/* Quick Extend Shortcuts */}
                          <button
                            type="button"
                            onClick={() => handleQuickExtendListing(listing, 1)}
                            title="Quickly add 1 hour to this auction"
                            className="px-2.5 py-2 text-xs bg-[var(--color-paper-soft)] hover:bg-[var(--color-gold)]/20 hover:text-[var(--color-gold)] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            +1h
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickExtendListing(listing, 24)}
                            title="Quickly add 24 hours (1 day) to this auction"
                            className="px-2.5 py-2 text-xs bg-[var(--color-paper-soft)] hover:bg-[var(--color-gold)]/20 hover:text-[var(--color-gold)] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            +24h
                          </button>

                          {/* Primary Edit Time Frame Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedListingForTimeFrame(listing)}
                            className="px-3.5 py-2 bg-[var(--color-gold)] hover:brightness-110 text-gray-950 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            id={`edit-schedule-btn-${listing.id}`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Edit Time Frame</span>
                          </button>

                          {/* Inspect Specs */}
                          <button
                            type="button"
                            onClick={() => setSelectedListingForDetail(listing)}
                            className="p-2 bg-[var(--color-paper-soft)] hover:bg-[var(--color-paper-soft)]/80 text-[var(--color-ink)] rounded-xl text-xs transition-all cursor-pointer"
                            title="Inspect full listing specifications"
                            id={`inspect-listing-btn-${listing.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: MANAGE USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">User Accounts Manager</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-[var(--color-paper-soft)]">
                  <thead>
                    <tr className="text-[var(--color-ink-soft)]/60 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email / Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-paper-soft)]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--color-paper-soft)]/30">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <img
                            src={u.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                            alt={u.name}
                            className="h-8 w-8 rounded-lg object-cover border border-[var(--color-paper-soft)]"
                          />
                          <div>
                            <p className="font-semibold text-[var(--color-ink)]">{u.name}</p>
                            <p className="text-[10px] text-[var(--color-ink-soft)]/60">{u.location.city}, {u.location.subCity}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[var(--color-ink-soft)]">
                          <p>{u.email}</p>
                          <p className="mt-0.5">{u.phone}</p>
                        </td>

                        <td className="py-3.5 px-4 font-semibold uppercase text-[10px] text-[var(--color-ink-soft)]/70">
                          {u.role.replace("_", " ")}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isBlocked ? (
                            <span className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                              Blocked
                            </span>
                          ) : u.isVerifiedSeller ? (
                            <span className="bg-[var(--color-verified-soft)] text-[var(--color-verified)] px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)] px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {!u.isVerifiedSeller && u.role !== UserRole.ADMIN && (
                            <button
                              onClick={() => verifySeller(u.id)}
                              className="bg-[var(--color-verified-soft)] text-[var(--color-verified)] hover:bg-[var(--color-verified)] hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                              id={`verify-seller-${u.id}`}
                            >
                              Verify Account
                            </button>
                          )}
                          {!u.isBlocked && u.role !== UserRole.ADMIN && (
                            <button
                              onClick={() => blockUser(u.id)}
                              className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                              id={`block-user-${u.id}`}
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: VERIFY SHOPS */}
          {activeTab === "shops" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">Shop Verification Applications</h3>
              
              {unverifiedShops.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <Check className="h-10 w-10 mx-auto text-[var(--color-verified)] mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">All shops are verified</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">There are no pending shop applications currently.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unverifiedShops.map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 rounded-2xl border border-[var(--color-paper-soft)] bg-[var(--color-paper)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={shop.logoUrl}
                          alt={shop.name}
                          className="h-12 w-12 rounded-xl object-cover border border-[var(--color-paper-soft)] bg-[var(--color-paper)]"
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--color-ink)]">{shop.name}</h4>
                          <p className="text-xs text-[var(--color-ink-soft)]/70 mt-0.5">{shop.location.address}</p>
                          <p className="text-[10px] text-[var(--color-ink-soft)]/60 mt-1">{shop.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => verifyShop(shop.id)}
                          className="bg-[var(--color-verified)] hover:bg-[var(--color-verified)]/90 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                          id={`approve-shop-${shop.id}`}
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Shop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: COMMUNITY REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">Community Moderator Queue</h3>
              
              {pendingReports.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <Check className="h-10 w-10 mx-auto text-[var(--color-verified)] mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">Reports queue is clean</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">No pending reports require actions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="border border-[var(--color-danger)]/20 p-4 rounded-2xl bg-[var(--color-danger)]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[var(--color-danger)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {rep.reason}
                          </span>
                          <span className="text-[10px] text-[var(--color-ink-soft)]/60 font-semibold">
                            Reported by: {rep.reporterName}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-[var(--color-ink)] pt-1">
                          Flagged Device: {rep.listingTitle}
                        </h4>
                        <p className="text-xs text-[var(--color-ink-soft)] italic bg-[var(--color-paper)] p-2.5 rounded-lg border border-[var(--color-paper-soft)]">
                          "{rep.details}"
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                        <button
                          onClick={() => resolveReport(rep.id, "dismiss")}
                          className="flex-1 md:flex-initial bg-[var(--color-paper-soft)] hover:bg-[var(--color-paper-soft)]/80 text-[var(--color-ink)] text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                          id={`dismiss-report-${rep.id}`}
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolveReport(rep.id, "delete_listing")}
                          className="flex-1 md:flex-initial bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                          id={`remove-listing-report-${rep.id}`}
                        >
                          <X className="h-4 w-4" /> Delete Listing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {selectedListingForTimeFrame && (
        <EditBidTimeFrameModal
          isOpen={!!selectedListingForTimeFrame}
          onClose={() => setSelectedListingForTimeFrame(null)}
          listing={selectedListingForTimeFrame}
        />
      )}

      {selectedListingForDetail && (
        <ListingDetail
          listing={selectedListingForDetail}
          onClose={() => setSelectedListingForDetail(null)}
          onOpenShop={() => {}}
        />
      )}
    </div>
  );
}
