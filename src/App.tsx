/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";
import AuctionCard from "./components/AuctionCard";
import ListingDetail from "./components/ListingDetail";
import BuyerDashboard from "./components/BuyerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import ShopProfileView from "./components/ShopProfileView";
import AdminPanel from "./components/AdminPanel";
import HeroSection from "./components/HeroSection";
import { BrandLogo } from "./components/Logo";
import { AuctionStatus, PhoneListing } from "./types";
import { ShieldCheck, Gavel, RefreshCw, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";

function MainAppContent() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    brandFilter,
    batteryFilter,
    conditionFilter,
    locationFilter,
    sortOption,
    listings,
    currentUser,
    simulateTimeTick,
    selectedStatus
  } = useApp();

  const [selectedListing, setSelectedListing] = useState<PhoneListing | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Filter listings based on navigation selections & search queries
  const filteredListings = listings.filter((listing) => {
    // 1. Filter by keyword (Model, brand, condition, details)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesText =
        listing.brand.toLowerCase().includes(q) ||
        listing.model.toLowerCase().includes(q) ||
        listing.conditionDetails.toLowerCase().includes(q);
      if (!matchesText) return false;
    }

    // 2. Filter by brand pill
    if (brandFilter !== "All") {
      if (listing.brand !== brandFilter) return false;
    }

    // 3. Filter by battery health threshold
    if (batteryFilter !== "All") {
      const bh = parseInt(batteryFilter.replace("+", ""));
      if (listing.batteryHealth < bh) return false;
    }

    // 4. Filter by phone condition
    if (conditionFilter !== "All") {
      if (listing.condition !== conditionFilter) return false;
    }

    // 5. Filter by sub-city or region
    if (locationFilter !== "All") {
      if (
        listing.sellerLocation.region !== locationFilter &&
        listing.sellerLocation.subCity !== locationFilter
      ) {
        return false;
      }
    }

    // Ensure only matching status items are queried
    if (selectedStatus === "live") {
      if (listing.status !== AuctionStatus.LIVE) return false;
    } else if (selectedStatus === "upcoming") {
      if (listing.status !== AuctionStatus.UPCOMING) return false;
    } else if (selectedStatus === "ended") {
      if (listing.status !== AuctionStatus.ENDED) return false;
    } else {
      // "all" - but only display live, upcoming, or ended auctions on the marketplace
      if (
        listing.status !== AuctionStatus.LIVE &&
        listing.status !== AuctionStatus.UPCOMING &&
        listing.status !== AuctionStatus.ENDED
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === "ending_soon") {
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    }
    if (sortOption === "price_asc") {
      return a.currentBid - b.currentBid;
    }
    if (sortOption === "price_desc") {
      return b.currentBid - a.currentBid;
    }
    if (sortOption === "newest") {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[var(--color-paper)] dark:bg-[var(--color-ink)] text-[var(--color-ink)] dark:text-gray-100 transition-colors duration-300">
      
      {/* Primary Navigation and Filter Bars */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* RENDER VIEW ACCORDING TO ACTIVETAB */}
      <main className="pb-16">
        
        {/* VIEW 1: LIVE AUCTIONS EXPLORER */}
        {activeTab === "home" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 animate-in fade-in duration-200">
            
            {/* Hero Section Banner */}
            <HeroSection />

            {/* Split view: Core listings alongside localized guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Listings Grid (Main 9 Cols) */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Search meta summary & simulate trigger */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-lg text-[var(--color-ink)] dark:text-white flex items-center gap-1.5">
                      🔥 Live Smartphone Auctions
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Showing {sortedListings.length} phones currently active in Addis Ababa
                    </p>
                  </div>

                  <button
                    onClick={simulateTimeTick}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] px-3.5 py-1.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                    title="Simulate 1 Hour Time Tick to update live countdowns and rival bids"
                    id="trigger-sim-tick"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin-slow" /> Tick Simulation
                  </button>
                </div>

                {/* Grid layout */}
                {sortedListings.length === 0 ? (
                  <div className="text-center py-16 bg-[var(--color-paper)] dark:bg-[var(--color-ink)] rounded-3xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
                    <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">No active auctions found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">Try removing active battery, brand, or sub-city filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedListings.map((listing) => (
                      <AuctionCard
                        key={listing.id}
                        listing={listing}
                        onViewDetails={setSelectedListing}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Trust guidelines Sidebar (3 Cols) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* IMEI & Trust Assurance Card */}
                <div className="bg-[var(--color-ink)] text-white rounded-3xl p-5 border border-[var(--color-ink-soft)] shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-20 w-20 bg-[var(--color-gold)]/5 rounded-full blur-2xl pointer-events-none"></div>
                  <h3 className="font-sans font-extrabold text-xs uppercase text-[var(--color-gold)] tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4.5 w-4.5" /> Handshake Guarantee
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium mt-3">
                    Every auction listed requires strict physical storefront checkups. Buyers inspect the phone condition inside verified shops before exchanging funds.
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2.5 uppercase tracking-wide">
                    Zero credit cards required • Pay via Telebirr or CBE Birr
                  </p>
                </div>

                {/* Safe Trading Procedures */}
                <div className="border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper)] dark:bg-[var(--color-ink)] rounded-3xl p-5 shadow-sm space-y-3.5">
                  <h4 className="font-sans font-extrabold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    🛒 Pickup Procedures
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex gap-2">
                      <div className="bg-[var(--color-gold-soft)]/30 text-[var(--color-gold)] font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-normal">
                        Place bid on phone. If you are highest bidder, you win instantly when time finishes.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[var(--color-gold-soft)]/30 text-[var(--color-gold)] font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-normal">
                        Retrieve the 6-Digit pickup confirmation code from your Buyer Panel.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[var(--color-gold-soft)]/30 text-[var(--color-gold)] font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-normal">
                        Visit the merchant shop, verify physical screen & battery, transfer Telebirr, and show pickup code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CBE Birr / Telebirr info card */}
                <div className="bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] rounded-3xl p-4.5 border border-[var(--color-gold)]/20 text-xs">
                  <p className="font-extrabold text-[var(--color-gold)] flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> Local Ethiopia Pricing
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium mt-1.5">
                    All prices are denoted in Ethiopian Birr (ETB). Exchange currencies manually if needed when negotiating at Bole shops.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: BUYER DASHBOARD */}
        {activeTab === "buyer" && (
          <BuyerDashboard onViewListing={(listing) => setSelectedListing(listing)} />
        )}

        {/* VIEW 3: SELLER DASHBOARD */}
        {activeTab === "seller" && (
          <SellerDashboard onViewListing={(listing) => setSelectedListing(listing)} />
        )}

        {/* VIEW 4: ADMIN CONTROL PANEL */}
        {activeTab === "admin" && (
          <AdminPanel />
        )}

        {/* VIEW 5: SHOP DETAIL PAGE */}
        {activeTab === "shop-profile" && selectedShopId && (
          <ShopProfileView
            shopId={selectedShopId}
            onClose={() => { setSelectedShopId(null); setActiveTab("home"); }}
            onViewListing={(listing) => setSelectedListing(listing)}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] bg-[var(--color-paper-soft)]/50 dark:bg-[var(--color-ink-soft)]/30 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo size="md" onClick={() => setActiveTab("home")} />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right font-medium">
            Ethiopia's Premium Smartphone Auction Platform • Verified Merchant Handshake System
          </p>
        </div>
      </footer>

      {/* DETAILS MODAL OVERLAY */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpenShop={(shopId) => {
            setSelectedShopId(shopId);
            setActiveTab("shop-profile");
            setSelectedListing(null);
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
