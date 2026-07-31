/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { PhoneListing, AuctionStatus, PhoneCondition, UserRole } from "../types";
import { X, Clock, MapPin, CheckCircle, ShieldCheck, Heart, Send, AlertTriangle, ChevronLeft, ChevronRight, Award, MessageSquare, Shield, Trash2 } from "lucide-react";

export default function ListingDetail({ listing, onClose, onOpenShop }: { listing: PhoneListing; onClose: () => void; onOpenShop: (shopId: string) => void }) {
  const {
    currentUser,
    placeBid,
    buyNow,
    bids,
    messages,
    sendMessage,
    submitReport,
    watchlist,
    toggleWatchlist,
    shops,
    users,
    updateListing,
    deleteListing,
    deleteBid,
    updateBidAmount
  } = useApp();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [bidValue, setBidValue] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  
  // Admin Editing Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editedBrand, setEditedBrand] = useState(listing.brand);
  const [editedModel, setEditedModel] = useState(listing.model);
  const [editedStorage, setEditedStorage] = useState(listing.storage);
  const [editedRam, setEditedRam] = useState(listing.ram);
  const [editedBattery, setEditedBattery] = useState(listing.batteryHealth.toString());
  const [editedCondition, setEditedCondition] = useState<PhoneCondition>(listing.condition);
  const [editedCondDetails, setEditedCondDetails] = useState(listing.conditionDetails);
  const [editedImei, setEditedImei] = useState(listing.imei);
  const [editedImages, setEditedImages] = useState<string[]>(listing.images);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  // Bidding details
  const [editedStartingBid, setEditedStartingBid] = useState(listing.startingBid.toString());
  const [editedCurrentBid, setEditedCurrentBid] = useState(listing.currentBid.toString());
  const [editedMinIncrement, setEditedMinIncrement] = useState(listing.minIncrement.toString());
  const [editedBuyNow, setEditedBuyNow] = useState(listing.buyNowPrice?.toString() || "");
  const [editedStatus, setEditedStatus] = useState<AuctionStatus>(listing.status);

  // Sync edits when listing changes
  useEffect(() => {
    setEditedBrand(listing.brand);
    setEditedModel(listing.model);
    setEditedStorage(listing.storage);
    setEditedRam(listing.ram);
    setEditedBattery(listing.batteryHealth.toString());
    setEditedCondition(listing.condition);
    setEditedCondDetails(listing.conditionDetails);
    setEditedImei(listing.imei);
    setEditedImages(listing.images);
    setEditedStartingBid(listing.startingBid.toString());
    setEditedCurrentBid(listing.currentBid.toString());
    setEditedMinIncrement(listing.minIncrement.toString());
    setEditedBuyNow(listing.buyNowPrice?.toString() || "");
    setEditedStatus(listing.status);
  }, [listing]);

  // Messaging state
  const [chatText, setChatText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Reporting state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Fake Listing");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const associatedShop = listing.shopId ? shops.find((s) => s.id === listing.shopId) : null;
  const sellerUser = users.find((u) => u.id === listing.sellerId);
  const isWatched = watchlist.includes(listing.id);

  // Filter bids for this specific listing, sorted high to low
  const listingBids = bids
    .filter((b) => b.listingId === listing.id)
    .sort((a, b) => b.amount - a.amount);
  
  const currentHighestBidder = listingBids[0];
  const bidCount = listingBids.length;
  const minNextBid = listing.currentBid + listing.minIncrement;

  // Auto-fill bid value on load
  useEffect(() => {
    setBidValue(minNextBid.toString());
  }, [listing.currentBid]);

  // Real-time Timer update
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(listing.startTime).getTime();
      const end = new Date(listing.endTime).getTime();

      if (listing.status === AuctionStatus.COMPLETED) {
        setTimeLeft("Auction Completed");
        return;
      }

      if (now < start) {
        const diff = start - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Starts in ${hours}h ${mins}m`);
      } else if (now >= start && now < end) {
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 24) {
          setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
        } else {
          setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        }
      } else {
        setTimeLeft("Ended");
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  // Scroll chat to bottom when chat updates or is shown
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChat, messages]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess(false);

    const amount = parseFloat(bidValue);
    if (isNaN(amount)) {
      setBidError("Please enter a valid bid amount.");
      return;
    }

    const res = placeBid(listing.id, amount);
    if (!res.success) {
      setBidError(res.error || "Failed to place bid");
    } else {
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
    }
  };

  const handleBuyNow = () => {
    if (window.confirm(`Are you sure you want to buy this phone instantly for ETB ${listing.buyNowPrice?.toLocaleString()}? This will end the auction immediately, and you can pick up the phone at the shop.`)) {
      const res = buyNow(listing.id);
      if (!res.success) {
        setBidError(res.error || "Failed Buy Now transaction");
      } else {
        setBidSuccess(true);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessage(listing.sellerId, listing.id, chatText.trim());
    setChatText("");
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    submitReport(listing.id, reportReason, reportDetails.trim());
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSubmitted(false);
      setReportDetails("");
    }, 3000);
  };

  const chatMessages = messages
    .filter(
      (m) =>
        m.listingId === listing.id &&
        ((m.senderId === currentUser.id && m.receiverId === listing.sellerId) ||
          (m.senderId === listing.sellerId && m.receiverId === currentUser.id))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Safe Trust & Fraud index computation
  const getTrustScore = () => {
    let score = 55;
    if (listing.isImeiVerified) score += 20;
    if (associatedShop?.isVerified) score += 15;
    if (listing.batteryHealth > 90) score += 10;
    if (listing.reportsCount > 0) score -= (listing.reportsCount * 25);
    return Math.max(10, Math.min(100, score));
  };

  // Admin Action Handlers
  const handleAdminDeleteListing = () => {
    if (window.confirm("⚠️ WARNING: Are you absolutely sure you want to permanently delete this phone listing and all its bids? This action cannot be undone.")) {
      deleteListing(listing.id);
      onClose();
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setEditedImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const batteryNum = parseInt(editedBattery) || 100;
    const startBidNum = parseInt(editedStartingBid) || 0;
    const curBidNum = parseInt(editedCurrentBid) || 0;
    const minIncNum = parseInt(editedMinIncrement) || 0;
    const buyNowNum = editedBuyNow ? parseInt(editedBuyNow) : undefined;

    updateListing(listing.id, {
      brand: editedBrand,
      model: editedModel,
      storage: editedStorage,
      ram: editedRam,
      batteryHealth: batteryNum,
      condition: editedCondition,
      conditionDetails: editedCondDetails,
      imei: editedImei,
      images: editedImages,
      startingBid: startBidNum,
      currentBid: curBidNum,
      minIncrement: minIncNum,
      buyNowPrice: buyNowNum,
      status: editedStatus
    });

    setIsEditing(false);
  };

  const score = getTrustScore();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-2 sm:p-4 select-none">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 font-extrabold text-xs tracking-wider uppercase bg-yellow-50 dark:bg-yellow-950/40 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-900 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Smartphone Auction
            </span>
            {listing.status === AuctionStatus.ENDED && (
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-bold">
                Auction Closed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(listing.id)}
              className={`p-2 rounded-xl border transition-all ${
                isWatched
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 border-gray-200 dark:border-gray-700 text-gray-500"
              }`}
              id={`watchlist-detail-${listing.id}`}
            >
              <Heart className={`h-4.5 w-4.5 ${isWatched ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              id="detail-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 p-4 rounded-2xl flex items-center gap-2 text-red-800 dark:text-red-400 text-xs font-bold mb-4">
                <Shield className="h-4.5 w-4.5" />
                EthioPhone Admin - Editing Mode
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section 1: Device Specs */}
                <div className="space-y-4">
                  <h3 className="font-sans font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider border-b pb-2">
                    Device Specifications
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Brand</label>
                      <input
                        type="text"
                        value={editedBrand}
                        onChange={(e) => setEditedBrand(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Model</label>
                      <input
                        type="text"
                        value={editedModel}
                        onChange={(e) => setEditedModel(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Storage</label>
                      <input
                        type="text"
                        value={editedStorage}
                        onChange={(e) => setEditedStorage(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RAM</label>
                      <input
                        type="text"
                        value={editedRam}
                        onChange={(e) => setEditedRam(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Battery Health (%)</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={editedBattery}
                        onChange={(e) => setEditedBattery(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Condition</label>
                      <select
                        value={editedCondition}
                        onChange={(e) => setEditedCondition(e.target.value as PhoneCondition)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                      >
                        <option value={PhoneCondition.NEW}>Brand New</option>
                        <option value={PhoneCondition.EXCELLENT}>Excellent</option>
                        <option value={PhoneCondition.VERY_GOOD}>Very Good</option>
                        <option value={PhoneCondition.GOOD}>Good</option>
                        <option value={PhoneCondition.FAIR}>Fair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">IMEI Number</label>
                      <input
                        type="text"
                        value={editedImei}
                        onChange={(e) => setEditedImei(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Condition details / Aesthetic description</label>
                    <textarea
                      rows={3}
                      value={editedCondDetails}
                      onChange={(e) => setEditedCondDetails(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Bidding Details */}
                <div className="space-y-4">
                  <h3 className="font-sans font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider border-b pb-2">
                    Bidding & Auction Setup
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Starting Bid (ETB)</label>
                      <input
                        type="number"
                        value={editedStartingBid}
                        onChange={(e) => setEditedStartingBid(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Current Bid (ETB)</label>
                      <input
                        type="number"
                        value={editedCurrentBid}
                        onChange={(e) => setEditedCurrentBid(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Min Increment (ETB)</label>
                      <input
                        type="number"
                        value={editedMinIncrement}
                        onChange={(e) => setEditedMinIncrement(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Buy Now Price (ETB, Optional)</label>
                      <input
                        type="number"
                        value={editedBuyNow}
                        onChange={(e) => setEditedBuyNow(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                        placeholder="e.g. 110000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Auction Status</label>
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value as AuctionStatus)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                    >
                      <option value={AuctionStatus.UPCOMING}>Upcoming</option>
                      <option value={AuctionStatus.LIVE}>Live</option>
                      <option value={AuctionStatus.ENDED}>Ended</option>
                      <option value={AuctionStatus.COMPLETED}>Completed</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Image Manager Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-sans font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  Manage Phone Images ({editedImages.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editedImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-150 dark:border-gray-800">
                      <img src={img} alt="preview" className="h-10 w-10 object-cover rounded-md" referrerPolicy="no-referrer" />
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const updated = [...editedImages];
                          updated[idx] = e.target.value;
                          setEditedImages(updated);
                        }}
                        className="flex-1 text-[10px] bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded p-1.5 focus:outline-none text-gray-800 dark:text-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setEditedImages(editedImages.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900 dark:text-white"
                    placeholder="Paste unsplash or image URL here to upload/add..."
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 rounded-xl text-xs font-bold transition-all"
                  >
                    Add Image URL
                  </button>
                </div>
              </div>

              {/* Manage Bids (Bidding Details) Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-sans font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  Manage Bids & Bidding History ({listingBids.length})
                </h3>

                {listingBids.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No bids placed yet on this auction.</p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                    {listingBids.map((b) => (
                      <div key={b.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-150 dark:border-gray-800 text-xs">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{b.bidderName}</p>
                          <p className="text-[10px] text-gray-500">{new Date(b.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400">ETB</span>
                          <input
                            type="number"
                            defaultValue={b.amount}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val !== b.amount) {
                                updateBidAmount(b.id, val);
                              }
                            }}
                            className="w-28 text-right bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-755 rounded p-1.5 font-black text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete bid of ETB ${b.amount.toLocaleString()}?`)) {
                                deleteBid(b.id);
                              }
                            }}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded"
                            title="Delete Bid"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save/Cancel Action Footer */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>

            </form>
          ) : (
            <>
              {currentUser.role === UserRole.ADMIN && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-red-800 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="h-4.5 w-4.5" /> EthioPhone Admin Moderation Control
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">You have authorized permissions to edit phone specifications, manage images, delete listing, or modify bidding details/bids.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      Edit Listing & Images
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminDeleteListing}
                      className="bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-950/40 text-red-600 border border-transparent hover:border-red-200 dark:hover:border-red-900 text-xs px-4 py-2 rounded-xl font-bold transition-all"
                    >
                      Delete Auction
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Gallery & Specs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Image Gallery */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-950 border border-gray-150 dark:border-gray-800/80 group">
                <div className="h-80 sm:h-96 flex items-center justify-center relative">
                  <img
                    src={listing.images[activeImgIdx] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"}
                    alt={`${listing.brand} ${listing.model}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImgIdx((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                        className="absolute left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActiveImgIdx((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {listing.images.length > 1 && (
                  <div className="flex p-3 gap-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIdx(idx)}
                        className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeImgIdx === idx ? "border-yellow-400 scale-105" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specification Table */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <h4 className="font-sans font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  📱 Device Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Brand / Model</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">{listing.brand}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{listing.model}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Storage Capacity</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">{listing.storage}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Built-in Flash</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">System RAM</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">{listing.ram}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">LPDDR standard</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Battery Health</p>
                    <p className={`text-xs font-bold mt-0.5 ${listing.batteryHealth >= 85 ? "text-green-600 dark:text-green-400" : "text-yellow-600"}`}>
                      {listing.batteryHealth}%
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Original Capacity</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 col-span-2">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">IMEI Serial (Ethio Telecom)</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wider">
                        {listing.imei}
                      </span>
                      {listing.isImeiVerified ? (
                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">
                          VERIFIED PASS
                        </span>
                      ) : (
                        <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md font-bold">
                          PENDING CHECK
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Accessories Included</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listing.accessories.map((acc, index) => (
                      <span key={index} className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-xl">
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed condition description */}
              <div>
                <h4 className="font-sans font-extrabold text-sm text-gray-900 dark:text-white mb-2">
                  Condition & Aesthetic State
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/10 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {listing.conditionDetails}
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Live Auction panel & Shop Profile */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* LIVE BIDDING CARD */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Timer details */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-black">Live countdown</span>
                    <p className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                      <Clock className="h-5 w-5 text-red-500 animate-pulse" />
                      {timeLeft}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Views Count</span>
                    <p className="text-sm font-bold text-white mt-1">{listing.views} visits</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-slate-800/60 p-4 rounded-2xl mb-5 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold">CURRENT BID</p>
                      <p className="text-3xl font-black text-yellow-400 mt-1">
                        ETB {listing.currentBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl">
                      <p className="text-xs text-slate-400 font-bold">Bids Placed</p>
                      <p className="text-base font-black text-white mt-0.5">{bidCount}</p>
                    </div>
                  </div>

                  {currentHighestBidder && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Highest Bidder:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        {currentHighestBidder.bidderId === currentUser.id ? "You (Winning)" : currentHighestBidder.bidderName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bid input form (Only if LIVE) */}
                {listing.status === AuctionStatus.LIVE && listing.sellerId !== currentUser.id && (
                  <form onSubmit={handlePlaceBid} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-extrabold text-sm">
                          ETB
                        </span>
                        <input
                          type="number"
                          step="100"
                          min={minNextBid}
                          value={bidValue}
                          onChange={(e) => setBidValue(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder={minNextBid.toString()}
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold px-6 py-3 rounded-xl text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                        id="submit-bid-btn"
                      >
                        Place Bid
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-slate-400">
                      Minimum required increment is <span className="font-bold text-white">ETB {listing.minIncrement.toLocaleString()}</span>. Bid must be at least <span className="font-bold text-yellow-400">ETB {minNextBid.toLocaleString()}</span>.
                    </p>

                    {bidError && (
                      <p className="text-xs text-red-400 font-medium bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
                        {bidError}
                      </p>
                    )}

                    {bidSuccess && (
                      <p className="text-xs text-green-400 font-semibold bg-green-950/40 p-2.5 rounded-lg border border-green-900/50">
                        🎉 Bid successfully recorded! You are currently the leading bidder.
                      </p>
                    )}
                  </form>
                )}

                {/* If it's your own phone listing */}
                {listing.sellerId === currentUser.id && (
                  <div className="bg-slate-800/40 text-center p-4 rounded-2xl border border-slate-700/50 text-slate-300 text-xs">
                    🔒 You own this listing. Monitor incoming bids from your Seller Dashboard.
                  </div>
                )}

                {/* Buy Now alternative */}
                {listing.status === AuctionStatus.LIVE && listing.buyNowPrice && listing.sellerId !== currentUser.id && (
                  <div className="mt-5 pt-5 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-2 font-bold text-center">or skip the bidding entirely</p>
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-750 hover:border-yellow-500/50 hover:text-yellow-400 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                      id="buy-now-btn"
                    >
                      Buy Instantly for ETB {listing.buyNowPrice.toLocaleString()}
                    </button>
                  </div>
                )}

                {/* Ended / Closed display */}
                {listing.status === AuctionStatus.ENDED && (
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                    <span className="text-xs font-bold text-slate-300">Auction Ended</span>
                    {listing.winnerId ? (
                      <div className="mt-2 text-yellow-400 font-extrabold text-sm">
                        Winner: {listing.winnerId === currentUser.id ? "You won this smartphone!" : users.find(u => u.id === listing.winnerId)?.name}
                      </div>
                    ) : (
                      <p className="text-slate-400 mt-1 text-xs">No bids were placed on this device.</p>
                    )}
                  </div>
                )}

                {listing.status === AuctionStatus.COMPLETED && (
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center text-green-400 text-xs font-bold">
                    🤝 Smartphone has been successfully inspected, paid in person, and picked up!
                  </div>
                )}
              </div>

              {/* TRUST INDEX BAR */}
              <div className="border border-gray-150 dark:border-gray-800 p-4 rounded-2xl bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    🛡️ Safe Market Trust Index
                  </span>
                  <span className="text-xs font-black text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 px-2 py-0.5 rounded-full">
                    {score}% Secure
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 mt-1.5 font-bold uppercase">
                  <span>Verify Specs in person</span>
                  <span>IMEI verified by Telecom</span>
                </div>
              </div>

              {/* SELLER CARD */}
              <div className="border border-gray-150 dark:border-gray-800 p-5 rounded-3xl bg-white dark:bg-gray-900 shadow-sm">
                <h4 className="font-sans font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  👤 Seller Profile
                </h4>

                <div className="flex items-start gap-4">
                  <img
                    src={associatedShop?.logoUrl || sellerUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                    alt={associatedShop?.name || sellerUser?.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-gray-100 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <h5 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      {associatedShop?.name || sellerUser?.name}
                      {(associatedShop?.isVerified || sellerUser?.isVerifiedSeller) && (
                        <CheckCircle className="h-4 w-4 fill-current text-blue-500 text-white dark:text-gray-900" />
                      )}
                    </h5>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {associatedShop?.location.city || "Addis Ababa"}, {associatedShop?.location.subCity || "Bole"}
                    </p>

                    <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                      ★ {associatedShop?.rating || sellerUser?.rating || "4.8"} ({associatedShop?.reviews.length || sellerUser?.reviewCount || "0"} ratings)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-2.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                    {associatedShop?.description || "Individual seller on EthioPhone Auction. Pay with Telebirr or CBE Birr in-person after inspecting the device."}
                  </p>

                  <div className="flex gap-2">
                    {associatedShop && (
                      <button
                        onClick={() => onOpenShop(associatedShop.id)}
                        className="flex-1 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold py-2 rounded-xl text-xs transition-all text-center"
                      >
                        Visit Shop
                      </button>
                    )}
                    
                    {listing.sellerId !== currentUser.id && (
                      <button
                        onClick={() => setShowChat(!showChat)}
                        className={`flex-1 flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl text-xs transition-all ${
                          showChat
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            : "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-sm"
                        }`}
                        id="open-chat-btn"
                      >
                        <MessageSquare className="h-4.5 w-4.5" />
                        {showChat ? "Close Chat" : "Ask Seller a Question"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct In-App Chat Panel */}
                {showChat && (
                  <div className="mt-4 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900/60 flex flex-col h-72 animate-in slide-in-from-top-3 duration-200">
                    <div className="p-3 bg-slate-900 text-white text-xs font-bold flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                      Live Chat with {associatedShop?.name || sellerUser?.name}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 flex flex-col">
                      {chatMessages.length === 0 ? (
                        <div className="m-auto text-center text-gray-400 dark:text-gray-500 p-4">
                          <p className="text-[11px] leading-relaxed">No messages yet. Ask about shop location, battery warranty, or in-person pickup hours!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                              msg.senderId === currentUser.id
                                ? "bg-yellow-400 text-slate-900 self-end rounded-tr-none"
                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 self-start rounded-tl-none"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span className="text-[8px] text-gray-400 dark:text-gray-500 block text-right mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={chatBottomRef}></div>
                    </div>

                    <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type message here..."
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <button type="submit" className="bg-yellow-400 text-slate-900 p-2 rounded-xl">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* FRAUD & COMMUNITY REPORT PANEL */}
              <div className="bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/40 rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500" /> Community Watchdog
                    </h5>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Help protect our Addis smartphone market</p>
                  </div>
                  {listing.reportsCount > 0 && (
                    <span className="bg-red-100 text-red-700 dark:bg-red-950 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      {listing.reportsCount} Reports
                    </span>
                  )}
                </div>

                {!showReportForm ? (
                  <button
                    onClick={() => setShowReportForm(true)}
                    className="w-full mt-3 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Report this Listing
                  </button>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-3 mt-3 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Reason for Report</label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none"
                      >
                        <option value="Duplicate Listing">Duplicate Listing (Same IMEI/Aesthetics)</option>
                        <option value="Inaccurate Specifications">Inaccurate Specs (RAM/Battery Health lied)</option>
                        <option value="Suspicious Price">Suspicious Pricing / Fraud Risk</option>
                        <option value="In person Scams">Seller asked for online payment before inspection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Supporting Details</label>
                      <textarea
                        rows={2}
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none"
                        placeholder="Please elaborate on why you are reporting this listing..."
                        required
                      ></textarea>
                    </div>

                    {reportSubmitted ? (
                      <p className="text-xs text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-200">
                        Thank you. Your community report has been securely registered.
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReportForm(false)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm"
                        >
                          Submit Report
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>

            </div>

          </div>
          </>
          )}
        </div>

      </div>
    </div>
  );
}
