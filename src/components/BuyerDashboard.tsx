/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AuctionStatus, PhoneListing } from "../types";
import { Gavel, Heart, Award, CheckSquare, MessageSquare, MapPin, Send, MessageCircle, AlertTriangle, Smartphone } from "lucide-react";

export default function BuyerDashboard({ onViewListing }: { onViewListing: (listing: PhoneListing) => void }) {
  const {
    currentUser,
    listings,
    bids,
    watchlist,
    getChatPartners,
    getMessagesForChat,
    sendMessage,
    users
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"bids" | "watchlist" | "won" | "chat">("bids");
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Get active user bids (unique listings the user has bid on)
  const userBiddedListingIds = Array.from(
    new Set(bids.filter((b) => b.bidderId === currentUser.id).map((b) => b.listingId))
  );

  const activeBidsListings = listings.filter(
    (l) => userBiddedListingIds.includes(l.id) && l.status === AuctionStatus.LIVE
  );

  // Filter watchlist items
  const watchedListings = listings.filter((l) => watchlist.includes(l.id));

  // Won listings (where status is ENDED or COMPLETED, and winnerId is active user)
  const wonListings = listings.filter(
    (l) => l.winnerId === currentUser.id && (l.status === AuctionStatus.ENDED || l.status === AuctionStatus.COMPLETED)
  );

  const pendingPickupsCount = wonListings.filter((l) => l.status === AuctionStatus.ENDED).length;

  // Chats partners and messages
  const chatPartners = getChatPartners();
  const activeChatMessages = selectedChatPartnerId ? getMessagesForChat(selectedChatPartnerId) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatPartnerId) return;

    // Find listing related to this chat, or default to a mock/general listing if none
    const relevantMessage = getMessagesForChat(selectedChatPartnerId)[0];
    const listingId = relevantMessage ? relevantMessage.listingId : "listing-general";

    sendMessage(selectedChatPartnerId, listingId, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Dashboard Title Card */}
      <div className="bg-[var(--color-ink)] rounded-3xl p-6 sm:p-8 shadow-xl text-[var(--color-paper)] mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-[var(--color-paper)]">
              My Buyer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-paper)]/70 font-medium mt-1">
              Check active bids, retrieve pickup confirmation codes, and negotiate in-shop pickups.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-[var(--color-paper-soft)]/10 px-4 py-2.5 rounded-2xl text-center backdrop-blur-sm border border-[var(--color-paper-soft)]/20">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-paper)]/70">Pending Pickups</p>
              <p className="text-xl font-display font-semibold text-[var(--color-gold-soft)] mt-0.5">{pendingPickupsCount}</p>
            </div>
            <div className="bg-[var(--color-paper-soft)]/10 px-4 py-2.5 rounded-2xl text-center backdrop-blur-sm border border-[var(--color-paper-soft)]/20">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-paper)]/70">Active Bids</p>
              <p className="text-xl font-display font-semibold text-[var(--color-gold-soft)] mt-0.5">{activeBidsListings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid structure: Sidebar Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sub-tabs menu */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--color-paper)] rounded-2xl p-2 border border-[var(--color-paper-soft)] space-y-1">
            <button
              onClick={() => setActiveSubTab("bids")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === "bids"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Gavel className="h-4.5 w-4.5" /> Active Bid Items
              </span>
              <span className="bg-[var(--color-paper-soft)] text-[10px] px-2 py-0.5 rounded-full font-bold text-[var(--color-ink)]">
                {activeBidsListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("watchlist")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === "watchlist"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4.5 w-4.5" /> Watchlist Favorites
              </span>
              <span className="bg-[var(--color-paper-soft)] text-[10px] px-2 py-0.5 rounded-full font-bold text-[var(--color-ink)]">
                {watchedListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("won")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === "won"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5" /> Won & Pickups
              </span>
              {pendingPickupsCount > 0 && (
                <span className="bg-[var(--color-danger)] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingPickupsCount} Code
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveSubTab("chat"); if (chatPartners.length > 0 && !selectedChatPartnerId) setSelectedChatPartnerId(chatPartners[0].id); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === "chat"
                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm font-bold"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5" /> Chat Messages
              </span>
              <span className="bg-[var(--color-paper-soft)] text-[10px] px-2 py-0.5 rounded-full font-bold text-[var(--color-ink)]">
                {chatPartners.length}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-9 bg-[var(--color-paper)] rounded-3xl border border-[var(--color-paper-soft)] p-6">
          
          {/* Sub-tab: ACTIVE BIDS */}
          {activeSubTab === "bids" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">My Active Bidding Items</h3>
              {activeBidsListings.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <Gavel className="h-10 w-10 mx-auto text-[var(--color-ink-soft)]/40 mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">No active bids</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">Browse phone listings and place your first bid in our live marketplace.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBidsListings.map((listing) => {
                    const listingBids = bids
                      .filter((b) => b.listingId === listing.id)
                      .sort((a, b) => b.amount - a.amount);
                    const highBid = listingBids[0];
                    const isWinning = highBid && highBid.bidderId === currentUser.id;

                    return (
                      <div
                        key={listing.id}
                        onClick={() => onViewListing(listing)}
                        className="p-4 rounded-2xl border border-[var(--color-paper-soft)] hover:border-[var(--color-gold)] transition-all bg-[var(--color-paper)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={listing.images[0]}
                            alt={listing.model}
                            className="h-14 w-14 rounded-xl object-cover border border-[var(--color-paper-soft)]"
                          />
                          <div>
                            <span className="text-[10px] font-bold bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)] px-2 py-0.5 rounded-md uppercase">
                              {listing.brand}
                            </span>
                            <h4 className="font-semibold text-sm text-[var(--color-ink)] mt-1">
                              {listing.brand} {listing.model} ({listing.storage})
                            </h4>
                            <p className="text-[10px] text-[var(--color-ink-soft)]/60 mt-0.5">
                              {listing.sellerLocation.city}, {listing.sellerLocation.subCity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-[var(--color-ink-soft)]/60 uppercase tracking-wider font-semibold">Your Status</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                              isWinning
                                ? "bg-[var(--color-verified-soft)] text-[var(--color-verified)] border-[var(--color-verified)]/20"
                                : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20"
                            }`}>
                              {isWinning ? "👑 WINNING" : "⚠️ OUTBID"}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-[var(--color-ink-soft)]/60 uppercase tracking-wider font-semibold">Current Bid</p>
                            <p className="text-sm font-display font-semibold text-[var(--color-gold)] mt-0.5">
                              ETB {listing.currentBid.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-[var(--color-ink-soft)]/60 mt-0.5">
                              {listingBids.length} bids placed
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: WATCHLIST FAVORITES */}
          {activeSubTab === "watchlist" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">My Watched Auctions</h3>
              {watchedListings.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <Heart className="h-10 w-10 mx-auto text-[var(--color-ink-soft)]/40 mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">Watchlist is empty</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1 font-sans">Tap the heart icon on any auction card to save items for instant tracking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {watchedListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onViewListing(listing)}
                      className="p-4 rounded-2xl border border-[var(--color-paper-soft)] hover:border-[var(--color-gold)] hover:shadow-sm bg-[var(--color-paper)] flex gap-3 cursor-pointer transition-all"
                    >
                      <img
                        src={listing.images[0]}
                        alt={listing.model}
                        className="h-16 w-16 rounded-xl object-cover border border-[var(--color-paper-soft)]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          listing.status === AuctionStatus.LIVE ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]" : "bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)]"
                        }`}>
                          {listing.status === AuctionStatus.LIVE ? "Live" : listing.status.replace("_", " ")}
                        </span>
                        <h4 className="font-semibold text-xs text-[var(--color-ink)] mt-1 truncate">
                          {listing.brand} {listing.model}
                        </h4>
                        <p className="text-[11px] font-display font-semibold text-[var(--color-gold)] mt-1">
                          ETB {listing.currentBid.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: WON & PICKUPS */}
          {activeSubTab === "won" && (
            <div className="space-y-5">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">My Won Auctions & Pickups</h3>
              
              <div className="bg-[var(--color-paper-soft)] border border-[var(--color-gold)]/30 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-[var(--color-gold)]" /> Physical Pickup Policy (Ethiopian Market)
                </h4>
                <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed font-medium">
                  We enforce zero online card payments. Visit the merchant's physical address below, inspect the smartphone battery health and screen, pay using <span className="font-bold text-[var(--color-gold)]">Telebirr, CBE Birr, or Cash</span>, and provide the <span className="font-bold text-[var(--color-danger)]">6-Digit Code</span> to the shop to authorize completion.
                </p>
              </div>

              {wonListings.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <Award className="h-10 w-10 mx-auto text-[var(--color-ink-soft)]/40 mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">No won auctions yet</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1 font-sans">Winning bids will display here, generating validation codes instantly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wonListings.map((listing) => {
                    const isCompleted = listing.status === AuctionStatus.COMPLETED;
                    return (
                      <div
                        key={listing.id}
                        className="border border-[var(--color-paper-soft)] rounded-2xl overflow-hidden bg-[var(--color-paper)] shadow-sm"
                      >
                        <div className="bg-[var(--color-paper-soft)]/50 px-4 py-3 border-b border-[var(--color-paper-soft)] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[var(--color-ink)]">
                              {listing.brand} {listing.model} ({listing.storage})
                            </span>
                            {isCompleted ? (
                              <span className="bg-[var(--color-verified-soft)] text-[var(--color-verified)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ✓ COMPLETED
                              </span>
                            ) : (
                              <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                🔑 PICKUP PENDING
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-display font-semibold text-[var(--color-gold)]">
                            Winning Bid: ETB {listing.currentBid.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Left layout with address */}
                          <div className="md:col-span-8 space-y-2 text-xs">
                            <div className="flex items-start gap-1.5 text-[var(--color-ink-soft)]">
                              <MapPin className="h-4 w-4 text-[var(--color-gold)] shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-[var(--color-ink)]">Shop Pickup Address:</p>
                                <p className="mt-0.5">{listing.sellerLocation.address}</p>
                                <p className="text-[var(--color-ink-soft)]/60 font-semibold uppercase text-[9px] mt-0.5">
                                  {listing.sellerLocation.region} • {listing.sellerLocation.city} • {listing.sellerLocation.subCity}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2.5 flex gap-2">
                              <button
                                onClick={() => onViewListing(listing)}
                                className="border border-[var(--color-paper-soft)] hover:bg-[var(--color-paper-soft)] text-[var(--color-ink)] font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                View Specs
                              </button>
                            </div>
                          </div>

                          {/* Right layout with verification code */}
                          <div className="md:col-span-4 bg-[var(--color-paper-soft)]/50 p-4 rounded-xl flex flex-col justify-center items-center text-center border border-[var(--color-paper-soft)]">
                            {!isCompleted ? (
                              <>
                                <p className="text-[10px] text-[var(--color-ink-soft)]/60 font-bold uppercase tracking-wider">Your Pickup Code</p>
                                <p className="text-2xl font-mono font-bold text-[var(--color-danger)] tracking-widest mt-1.5 bg-[var(--color-paper)] border border-[var(--color-paper-soft)] px-4 py-1.5 rounded-lg shadow-inner">
                                  {listing.pickupCode || "------"}
                                </p>
                                <p className="text-[9px] text-[var(--color-ink-soft)]/60 mt-2">
                                  Show this code to the merchant ONLY after physical inspection and payment.
                                </p>
                              </>
                            ) : (
                              <div className="text-[var(--color-verified)] flex flex-col items-center">
                                <CheckSquare className="h-8 w-8 mb-1" />
                                <span className="text-xs font-bold uppercase">Transaction Verified</span>
                                <span className="text-[9px] text-[var(--color-ink-soft)]/60 mt-1">Paid & Collected in Bole Shop</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: CHAT MESSAGES */}
          {activeSubTab === "chat" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">My Chat Box</h3>
              {chatPartners.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
                  <MessageCircle className="h-10 w-10 mx-auto text-[var(--color-ink-soft)]/40 mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">No active chats</p>
                  <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1 font-sans">Send queries directly from the specification details modal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 border border-[var(--color-paper-soft)] rounded-2xl overflow-hidden h-96">
                  
                  {/* Left panel: chats partners list */}
                  <div className="md:col-span-4 border-r border-[var(--color-paper-soft)] overflow-y-auto bg-[var(--color-paper-soft)]/30">
                    {chatPartners.map((partner) => {
                      const isActive = selectedChatPartnerId === partner.id;
                      return (
                        <button
                          key={partner.id}
                          onClick={() => setSelectedChatPartnerId(partner.id)}
                          className={`w-full text-left p-3 border-b border-[var(--color-paper-soft)] flex items-center gap-2.5 transition-all ${
                            isActive ? "bg-[var(--color-gold)] text-[var(--color-ink)]" : "hover:bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)]"
                          }`}
                        >
                          <img
                            src={partner.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                            alt={partner.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate leading-normal">{partner.name}</p>
                            <p className={`text-[9px] uppercase font-medium ${isActive ? "text-[var(--color-ink)]/80" : "text-[var(--color-ink-soft)]/60"}`}>
                              {partner.role.replace("_", " ")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right panel: Chat messages window */}
                  <div className="md:col-span-8 flex flex-col h-full bg-[var(--color-paper)]">
                    {selectedChatPartnerId ? (
                      <>
                        <div className="p-3 border-b border-[var(--color-paper-soft)] bg-[var(--color-paper-soft)]/50 text-xs font-semibold text-[var(--color-ink)]">
                          Active Chat with {users.find((u) => u.id === selectedChatPartnerId)?.name}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                          {activeChatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                msg.senderId === currentUser.id
                                  ? "bg-[var(--color-gold)] text-[var(--color-ink)] self-end rounded-tr-none shadow-sm"
                                  : "bg-[var(--color-paper-soft)] text-[var(--color-ink)] border border-[var(--color-paper-soft)] self-start rounded-tl-none shadow-sm"
                              }`}
                            >
                              <p>{msg.text}</p>
                              <span className="text-[8px] opacity-60 block text-right mt-1.5">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--color-paper-soft)] bg-[var(--color-paper)] flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-[var(--color-paper-soft)] border border-[var(--color-paper-soft)] text-[var(--color-ink)] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                          />
                          <button
                            type="submit"
                            className="bg-[var(--color-gold)] text-[var(--color-ink)] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[var(--color-gold-soft)] transition-colors"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="m-auto text-center text-[var(--color-ink-soft)]/60">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[var(--color-ink-soft)]/40" />
                        <p className="text-xs">Select a contact to view chat logs.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
