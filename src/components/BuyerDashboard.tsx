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
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900 mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight">
              My Buyer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">
              Check active bids, retrieve pickup confirmation codes, and negotiate in-shop pickups.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/20 px-4 py-2.5 rounded-2xl text-center backdrop-blur-sm border border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-800">Pending Pickups</p>
              <p className="text-xl font-black mt-0.5">{pendingPickupsCount}</p>
            </div>
            <div className="bg-white/20 px-4 py-2.5 rounded-2xl text-center backdrop-blur-sm border border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-800">Active Bids</p>
              <p className="text-xl font-black mt-0.5">{activeBidsListings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid structure: Sidebar Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sub-tabs menu */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 border border-gray-150 dark:border-gray-800 space-y-1">
            <button
              onClick={() => setActiveSubTab("bids")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "bids"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Gavel className="h-4.5 w-4.5" /> Active Bid Items
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black text-gray-700 dark:text-gray-300">
                {activeBidsListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("watchlist")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "watchlist"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4.5 w-4.5" /> Watchlist Favorites
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black text-gray-700 dark:text-gray-300">
                {watchedListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("won")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "won"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5" /> Won & Pickups
              </span>
              {pendingPickupsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black animate-pulse">
                  {pendingPickupsCount} Code
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveSubTab("chat"); if (chatPartners.length > 0 && !selectedChatPartnerId) setSelectedChatPartnerId(chatPartners[0].id); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "chat"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5" /> Chat Messages
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black text-gray-700 dark:text-gray-300">
                {chatPartners.length}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-9 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6">
          
          {/* Sub-tab: ACTIVE BIDS */}
          {activeSubTab === "bids" && (
            <div className="space-y-4">
              <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white mb-2">My Active Bidding Items</h3>
              {activeBidsListings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Gavel className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No active bids</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browse phone listings and place your first bid in our live marketplace.</p>
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
                        className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all bg-white dark:bg-gray-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={listing.images[0]}
                            alt={listing.model}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div>
                            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
                              {listing.brand}
                            </span>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                              {listing.brand} {listing.model} ({listing.storage})
                            </h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {listing.sellerLocation.city}, {listing.sellerLocation.subCity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Your Status</p>
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border mt-1 ${
                              isWinning
                                ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
                                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                            }`}>
                              {isWinning ? "👑 WINNING" : "⚠️ OUTBID"}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Current Bid</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                              ETB {listing.currentBid.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
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
              <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white mb-2">My Watched Auctions</h3>
              {watchedListings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Heart className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">Watchlist is empty</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">Tap the heart icon on any auction card to save items for instant tracking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {watchedListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onViewListing(listing)}
                      className="p-4 rounded-2xl border border-gray-150 dark:border-gray-800/80 hover:border-yellow-400 hover:shadow-sm bg-white dark:bg-gray-900 flex gap-3 cursor-pointer transition-all"
                    >
                      <img
                        src={listing.images[0]}
                        alt={listing.model}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          listing.status === AuctionStatus.LIVE ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {listing.status === AuctionStatus.LIVE ? "Live" : listing.status.replace("_", " ")}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-1 truncate">
                          {listing.brand} {listing.model}
                        </h4>
                        <p className="text-[11px] font-black text-yellow-600 dark:text-yellow-400 mt-1">
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
              <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white mb-2">My Won Auctions & Pickups</h3>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/15 border border-yellow-200 dark:border-yellow-900/60 p-4 rounded-2xl">
                <h4 className="text-xs font-extrabold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-4.5 w-4.5" /> Physical Pickup Policy (Ethiopian Market)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  We enforce zero online card payments. Visit the merchant's physical address below, inspect the smartphone battery health and screen, pay using <span className="font-bold text-yellow-600">Telebirr, CBE Birr, or Cash</span>, and provide the <span className="font-bold text-red-500">6-Digit Code</span> to the shop to authorize completion.
                </p>
              </div>

              {wonListings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Award className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No won auctions yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">Winning bids will display here, generating validation codes instantly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wonListings.map((listing) => {
                    const isCompleted = listing.status === AuctionStatus.COMPLETED;
                    return (
                      <div
                        key={listing.id}
                        className="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/40 px-4 py-3 border-b border-gray-150 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {listing.brand} {listing.model} ({listing.storage})
                            </span>
                            {isCompleted ? (
                              <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                                ✓ COMPLETED
                              </span>
                            ) : (
                              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                🔑 PICKUP PENDING
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                            Winning Bid: ETB {listing.currentBid.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Left layout with address */}
                          <div className="md:col-span-8 space-y-2 text-xs">
                            <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">Shop Pickup Address:</p>
                                <p className="mt-0.5">{listing.sellerLocation.address}</p>
                                <p className="text-gray-400 font-bold uppercase text-[9px] mt-0.5">
                                  {listing.sellerLocation.region} • {listing.sellerLocation.city} • {listing.sellerLocation.subCity}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2.5 flex gap-2">
                              <button
                                onClick={() => onViewListing(listing)}
                                className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold px-3 py-1.5 rounded-lg text-xs"
                              >
                                View Specs
                              </button>
                            </div>
                          </div>

                          {/* Right layout with verification code */}
                          <div className="md:col-span-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex flex-col justify-center items-center text-center border border-gray-100 dark:border-gray-700">
                            {!isCompleted ? (
                              <>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">Your Pickup Code</p>
                                <p className="text-2xl font-mono font-black text-red-500 tracking-widest mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-1.5 rounded-lg shadow-inner">
                                  {listing.pickupCode || "------"}
                                </p>
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2">
                                  Show this code to the merchant ONLY after physical inspection and payment.
                                </p>
                              </>
                            ) : (
                              <div className="text-green-500 flex flex-col items-center">
                                <CheckSquare className="h-8 w-8 mb-1" />
                                <span className="text-xs font-black uppercase">Transaction Verified</span>
                                <span className="text-[9px] text-gray-400 mt-1">Paid & Collected in Bole Shop</span>
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
              <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white mb-2">My Chat Box</h3>
              {chatPartners.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <MessageCircle className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No active chats</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">Send queries directly from the specification details modal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden h-96">
                  
                  {/* Left panel: chats partners list */}
                  <div className="md:col-span-4 border-r border-gray-150 dark:border-gray-800 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
                    {chatPartners.map((partner) => {
                      const isActive = selectedChatPartnerId === partner.id;
                      return (
                        <button
                          key={partner.id}
                          onClick={() => setSelectedChatPartnerId(partner.id)}
                          className={`w-full text-left p-3 border-b border-gray-150 dark:border-gray-800/60 flex items-center gap-2.5 transition-all ${
                            isActive ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <img
                            src={partner.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                            alt={partner.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate leading-normal">{partner.name}</p>
                            <p className={`text-[9px] uppercase font-semibold ${isActive ? "text-slate-800" : "text-gray-400"}`}>
                              {partner.role.replace("_", " ")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right panel: Chat messages window */}
                  <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-gray-900">
                    {selectedChatPartnerId ? (
                      <>
                        <div className="p-3 border-b border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 text-xs font-bold text-gray-800 dark:text-gray-200">
                          Active Chat with {users.find((u) => u.id === selectedChatPartnerId)?.name}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                          {activeChatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                msg.senderId === currentUser.id
                                  ? "bg-yellow-400 text-slate-900 self-end rounded-tr-none shadow-sm"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-750 self-start rounded-tl-none shadow-sm"
                              }`}
                            >
                              <p>{msg.text}</p>
                              <span className="text-[8px] text-gray-400 dark:text-gray-500 block text-right mt-1.5">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                          <button
                            type="submit"
                            className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 hover:bg-yellow-500"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="m-auto text-center text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
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
