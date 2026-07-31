/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PhoneListing, AuctionStatus, PhoneCondition, UserRole } from "../types";
import { Gavel, Plus, History, CheckSquare, Settings, Eye, HelpCircle, AlertCircle, ShoppingBag, ShieldCheck, Trash2, Key, Shield } from "lucide-react";

export default function SellerDashboard({ onViewListing }: { onViewListing: (listing: PhoneListing) => void }) {
  const {
    currentUser,
    listings,
    createListing,
    deleteListing,
    verifyPickupCode,
    registerShop,
    shops
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"listings" | "create" | "pickup" | "shop">("listings");
  
  // Create Form State
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("256GB");
  const [ram, setRam] = useState("8GB");
  const [battery, setBattery] = useState("90");
  const [condition, setCondition] = useState<PhoneCondition>(PhoneCondition.EXCELLENT);
  const [condDetails, setCondDetails] = useState("");
  const [imei, setImei] = useState("");
  const [accessories, setAccessories] = useState<string[]>(["Original Box", "Type-C Cable"]);
  const [startingBid, setStartingBid] = useState("45000");
  const [minIncrement, setMinIncrement] = useState("500");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [durationDays, setDurationDays] = useState("3");
  const [region, setRegion] = useState("Addis Ababa");
  const [city, setCity] = useState("Addis Ababa");
  const [subCity, setSubCity] = useState("Bole");
  const [address, setAddress] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Shop Registration State
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopLogo, setShopLogo] = useState("");

  // Pickup Verification State
  const [pickupListingId, setPickupListingId] = useState("");
  const [pickupCode, setPickupCode] = useState("");
  const [pickupError, setPickupError] = useState("");
  const [pickupSuccess, setPickupSuccess] = useState(false);

  // Filter listings owned by the active user
  const sellerListings = listings.filter((l) => l.sellerId === currentUser.id);
  const activeAuctions = sellerListings.filter((l) => l.status === AuctionStatus.LIVE || l.status === AuctionStatus.UPCOMING);
  const completedAuctions = sellerListings.filter((l) => l.status === AuctionStatus.COMPLETED);
  const pendingPickupAuctions = sellerListings.filter((l) => l.status === AuctionStatus.ENDED && l.winnerId);

  const userShop = shops.find((s) => s.ownerId === currentUser.id);

  const accessoryOptions = [
    "Original Box",
    "Original Charger",
    "Type-C Cable",
    "Lightning Cable",
    "Original Earphones",
    "Screen Guard Applied",
    "Silicone Case",
    "Shop Warranty Receipt"
  ];

  const toggleAccessory = (acc: string) => {
    setAccessories((prev) =>
      prev.includes(acc) ? prev.filter((item) => item !== acc) : [...prev, acc]
    );
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!model.trim()) {
      setFormError("Device Model is required (e.g. iPhone 15 Pro, Galaxy S24).");
      return;
    }

    if (!imei.trim()) {
      setFormError("IMEI number is required for trust verification.");
      return;
    }

    if (!address.trim()) {
      setFormError("Physical shop or meeting address is required.");
      return;
    }

    const startAmount = parseFloat(startingBid);
    const increment = parseFloat(minIncrement);
    const buyNowVal = buyNowPrice ? parseFloat(buyNowPrice) : undefined;
    const bh = parseInt(battery);

    if (isNaN(startAmount) || startAmount <= 0) {
      setFormError("Starting bid must be a valid positive number in ETB.");
      return;
    }

    if (isNaN(increment) || increment <= 0) {
      setFormError("Minimum bid increment must be positive.");
      return;
    }

    if (buyNowVal && buyNowVal <= startAmount) {
      setFormError("Buy Now price must be higher than the starting bid.");
      return;
    }

    // Set durations
    const startTime = new Date().toISOString();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + parseInt(durationDays));

    // Compile images
    const finalImages = imageInput.trim()
      ? [imageInput.trim()]
      : ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"];

    const res = createListing({
      brand,
      model,
      storage,
      ram,
      batteryHealth: isNaN(bh) ? 90 : bh,
      condition,
      conditionDetails: condDetails.trim() || `Clean used ${brand} ${model} in ${condition} condition.`,
      imei,
      accessories,
      images: finalImages,
      startingBid: startAmount,
      minIncrement: increment,
      buyNowPrice: buyNowVal,
      sellerLocation: {
        region,
        city,
        subCity,
        address: address.trim()
      },
      startTime,
      endTime: endTime.toISOString()
    });

    if (!res.success) {
      setFormError(res.error || "Failed to create listing.");
    } else {
      setFormSuccess(true);
      // Reset form
      setModel("");
      setImei("");
      setCondDetails("");
      setAddress("");
      setImageInput("");
      setTimeout(() => {
        setFormSuccess(false);
        setActiveSubTab("listings");
      }, 2500);
    }
  };

  const handleRegisterShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !shopPhone.trim() || !shopAddress.trim()) {
      alert("Please fill in Shop Name, Phone, and Address.");
      return;
    }

    registerShop({
      name: shopName.trim(),
      phone: shopPhone.trim(),
      description: shopDesc.trim() || "Clean certified mobile dealer.",
      location: {
        region: "Addis Ababa",
        city: "Addis Ababa",
        subCity: "Bole",
        address: shopAddress.trim()
      },
      logoUrl: shopLogo.trim() || "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=150&auto=format&fit=crop&q=80"
    });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPickupError("");
    setPickupSuccess(false);

    if (!pickupListingId) {
      setPickupError("Please select a smartphone listing.");
      return;
    }

    if (!pickupCode.trim()) {
      setPickupError("Please enter the 6-digit confirmation code.");
      return;
    }

    const res = verifyPickupCode(pickupListingId, pickupCode.trim());
    if (!res.success) {
      setPickupError(res.error || "Verification failed");
    } else {
      setPickupSuccess(true);
      setPickupCode("");
      setPickupListingId("");
      setTimeout(() => setPickupSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Title Header bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight">
                Seller & Merchant Dashboard
              </h1>
              {userShop?.isVerified && (
                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> VERIFIED SHOP
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed max-w-xl">
              {userShop
                ? `Managing listings for "${userShop.name}". Double check IMEIs before publishing to retain your high-trust seller rank.`
                : "List your used phones, track live bidding, and authorize completed in-person cash sales."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab("create")}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-yellow-400/5 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Phone Auction
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sub-tab Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 border border-gray-150 dark:border-gray-800 space-y-1">
            <button
              onClick={() => setActiveSubTab("listings")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "listings"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5" /> My Active Auctions
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full font-black text-gray-700 dark:text-gray-300">
                {activeAuctions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("create")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "create"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4.5 w-4.5" /> Create New Listing
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("pickup")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "pickup"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Key className="h-4.5 w-4.5" /> Verify In-Shop Pickup
              </span>
              {pendingPickupAuctions.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                  {pendingPickupAuctions.length} Wait
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("shop")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "shop"
                  ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5" /> Storefront Profiles
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                {userShop ? "Active" : "Register"}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="lg:col-span-9 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6">
          
          {/* Sub-tab: ACTIVE LISTINGS */}
          {activeSubTab === "listings" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white">Active Phone Listings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monitor current high-bids on your devices</p>
              </div>

              {activeAuctions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <ShoppingBag className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No active smartphone auctions</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">List clean devices with verified IMEI keys to unlock buyers in Addis Ababa.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAuctions.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={listing.images[0]}
                          alt={listing.model}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                              {listing.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              IMEI: {listing.imei}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                            {listing.brand} {listing.model} ({listing.storage})
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Minimum Increment: ETB {listing.minIncrement.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Current Bid</p>
                          <p className="text-base font-black text-yellow-600 dark:text-yellow-400 mt-0.5">
                            ETB {listing.currentBid.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewListing(listing)}
                            className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 p-2 rounded-xl text-gray-600 dark:text-gray-400"
                            title="Preview specs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteListing(listing.id)}
                            className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 p-2 rounded-xl text-red-600 dark:text-red-400"
                            title="Delete listing"
                            id={`delete-listing-${listing.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Sales History */}
              {completedAuctions.length > 0 && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-sans font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    🏪 Completed Sales History
                  </h3>
                  <div className="space-y-2">
                    {completedAuctions.map((listing) => (
                      <div
                        key={listing.id}
                        className="p-3 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4.5 w-4.5 text-green-500" />
                          <span className="font-bold">{listing.brand} {listing.model}</span>
                        </div>
                        <span className="text-gray-500">
                          Sold for <strong className="text-gray-900 dark:text-white">ETB {listing.currentBid.toLocaleString()}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: CREATE LISTING */}
          {activeSubTab === "create" && (
            currentUser.role !== UserRole.ADMIN ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white">Admin Privileges Required</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Only the <strong>EthioPhone Admin</strong> has authorized privileges to upload listings, manage phone images, or edit bidding details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAuction} className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white">List Used Smartphone</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">All auctions are subject to IMEI verification protocol</p>
              </div>

              {/* Duplicate check info */}
              <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/60 p-3.5 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed font-medium">
                  <strong>Automatic Fraud Check:</strong> The system automatically cross-references submitted IMEI codes against active listings to prevent duplicate spam. Ensure your device is in physical possession before listing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manufacturer / Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Infinix">Infinix</option>
                    <option value="Tecno">Tecno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    id="listing-model-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage Flash</label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System RAM</label>
                  <select
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="4GB">4GB</option>
                    <option value="6GB">6GB</option>
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">General Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as PhoneCondition)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  >
                    <option value={PhoneCondition.NEW}>Brand New (Unopened)</option>
                    <option value={PhoneCondition.EXCELLENT}>Excellent (Like New)</option>
                    <option value={PhoneCondition.VERY_GOOD}>Very Good (Minor Marks)</option>
                    <option value={PhoneCondition.GOOD}>Good (Fully Functional)</option>
                    <option value={PhoneCondition.FAIR}>Fair (Significant Scuffs)</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aesthetic State / Extra Details</label>
                  <textarea
                    rows={2}
                    value={condDetails}
                    onChange={(e) => setCondDetails(e.target.value)}
                    placeholder="Provide details about scratches, Face ID state, screen replacements, or specific details..."
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IMEI Code (15-Digits)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={imei}
                    onChange={(e) => setImei(e.target.value.replace(/\s+/g, ""))}
                    placeholder="Enter device IMEI"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Image URL (or blank for mockup)</label>
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Accessories options */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Accessories Included</label>
                <div className="flex flex-wrap gap-2">
                  {accessoryOptions.map((acc) => {
                    const isSelected = accessories.includes(acc);
                    return (
                      <button
                        type="button"
                        key={acc}
                        onClick={() => toggleAccessory(acc)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-yellow-400 dark:bg-yellow-500 text-slate-900 border-yellow-400"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {acc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bidding settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Starting Bid (Birr)</label>
                  <input
                    type="number"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Bid Increment (Birr)</label>
                  <input
                    type="number"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instant Buy Now Price (Optional)</label>
                  <input
                    type="number"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="No Buy Now"
                    className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Auction Duration (Days)</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="1">1 Day (Fast Liquidity)</option>
                    <option value="3">3 Days (Recommended)</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
              </div>

              {/* Physical Meeting / Shop Location details */}
              <div className="space-y-4">
                <h4 className="font-sans font-extrabold text-xs uppercase text-gray-500 tracking-wider">
                  📍 Inspection & Handover Location (In-Person Handshake Only)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Amhara">Amhara</option>
                      <option value="Sidama">Sidama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sub-City / Kebele</label>
                    <input
                      type="text"
                      value={subCity}
                      onChange={(e) => setSubCity(e.target.value)}
                      placeholder="e.g. Bole, Kirkos, Yeka"
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store / Meeting address Details</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Bole Olympia, Stadium Building Shop #10, Kebele 02 highway"
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status Reporting feedback */}
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/60 rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  🎉 Device listed successfully. IMEI check passed! Redirecting...
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all uppercase tracking-wider"
              >
                Publish Live Smartphone Auction
              </button>
            </form>
            )
          )}

          {/* Sub-tab: VERIFY PICKUP */}
          {activeSubTab === "pickup" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white">Verify In-Person Pickup</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Validate the buyer's payment and release smartphone</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                <strong>Handover Protocol:</strong> Verify payment on your Telebirr/CBE account, allow the customer to inspect screen, camera, and original serials. Once satisfied, input their 6-digit confirmation code below to register completion.
              </div>

              {pendingPickupAuctions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Key className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No pending pickups</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending pick-up items will display here once their auctions conclude with bids.</p>
                </div>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4 max-w-md bg-gray-50 dark:bg-gray-800/20 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Smartphone Sold</label>
                    <select
                      value={pickupListingId}
                      onChange={(e) => setPickupListingId(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">-- Choose device --</option>
                      {pendingPickupAuctions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} {p.model} (Winner Bid: ETB {p.currentBid.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buyer's 6-Digit Confirmation Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pickupCode}
                      onChange={(e) => setPickupCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 824915"
                      className="w-full text-center font-mono font-black text-lg tracking-widest bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      id="pickup-code-input"
                    />
                  </div>

                  {pickupError && (
                    <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/60">
                      {pickupError}
                    </p>
                  )}

                  {pickupSuccess && (
                    <p className="text-xs text-green-600 font-black bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg border border-green-200 dark:border-green-900/60">
                      🎉 Verification code matched! Transaction logged as completed.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black py-3 rounded-xl text-xs transition-all uppercase tracking-wider shadow-md"
                  >
                    Confirm Handover & Complete Order
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sub-tab: SHOP MANAGEMENT */}
          {activeSubTab === "shop" && (
            <div className="space-y-6">
              {userShop ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-800 text-white rounded-3xl relative overflow-hidden shadow-md">
                    <h4 className="font-sans font-extrabold text-xl">{userShop.name}</h4>
                    <p className="text-xs text-blue-200 mt-1">{userShop.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="bg-white/25 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                        ★ {userShop.rating} Shop Rank
                      </span>
                      {userShop.isVerified ? (
                        <span className="bg-green-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black uppercase flex items-center gap-1 shadow">
                          <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED OUTLET
                        </span>
                      ) : (
                        <span className="bg-yellow-500 text-slate-900 text-[10px] px-2.5 py-1 rounded-full font-black uppercase">
                          UNDER REVIEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1.5 bg-gray-50 dark:bg-gray-800/10 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p><strong>Bole Office:</strong> {userShop.location.address}</p>
                    <p><strong>Store Contact:</strong> {userShop.phone}</p>
                    <p className="pt-2 text-gray-400">Note: To update logo banners, storefront designs, or verified license credentials, contact EthioPhone System Administrator.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterShop} className="space-y-4 max-w-lg">
                  <div>
                    <h3 className="font-sans font-extrabold text-lg text-gray-900 dark:text-white">Register Physical Phone Shop</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unlock custom merchant profile, ratings, and higher credibility rank</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Registered Shop Name</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Bole Digital Cell Plaza"
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={shopPhone}
                        onChange={(e) => setShopPhone(e.target.value)}
                        placeholder="e.g. +251 911 445566"
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shop Logo URL (Optional)</label>
                      <input
                        type="url"
                        value={shopLogo}
                        onChange={(e) => setShopLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">About our Shop & Warranties</label>
                      <textarea
                        rows={3}
                        value={shopDesc}
                        onChange={(e) => setShopDesc(e.target.value)}
                        placeholder="Explain your in-store warranty details, inspection environment, accepted payment banks..."
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Physical Store Street Address (Bole / Kirkos / etc)</label>
                      <input
                        type="text"
                        required
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. Bole Olympia Square, Stadium Tower Shop #14"
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-3 rounded-xl text-xs shadow-md uppercase tracking-wider"
                  >
                    Submit Storefront Application
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
