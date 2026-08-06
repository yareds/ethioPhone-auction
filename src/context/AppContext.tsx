/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserProfile, ShopProfile, PhoneListing, Bid, ChatMessage, Report, Notification, UserRole, AuctionStatus, PhoneCondition } from "../types";
import { initialUsers, initialShops, initialListings, initialBids, initialMessages, initialReports } from "../data/mockData";

export const guestUser: UserProfile = {
  id: "guest",
  name: "Guest Explorer",
  email: "guest@ethiophone.com",
  phone: "",
  role: UserRole.BUYER,
  location: {
    region: "Addis Ababa",
    city: "Addis Ababa",
    subCity: "Bole",
    address: "Bole Olympia"
  },
  rating: 5.0,
  reviewCount: 0,
  isVerifiedSeller: false,
  joinedDate: new Date().toISOString()
};

interface AppContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  shops: ShopProfile[];
  listings: PhoneListing[];
  bids: Bid[];
  messages: ChatMessage[];
  reports: Report[];
  notifications: Notification[];
  watchlist: string[]; // Listing IDs

  // Auth Operations
  switchUser: (userId: string) => void;
  signOut: () => void;
  signupUser: (userData: {
    name: string;
    email: string;
    phone: string;
    location: {
      region: string;
      city: string;
      subCity: string;
      address: string;
    };
    role: UserRole;
  }) => UserProfile;
  updateProfile: (profileData: Partial<UserProfile>) => void;
  registerShop: (shopData: Omit<ShopProfile, "id" | "ownerId" | "rating" | "reviews" | "isVerified">) => void;

  // Listing Operations
  createListing: (listingData: Omit<PhoneListing, "id" | "sellerId" | "shopId" | "currentBid" | "status" | "isImeiVerified" | "createdAt" | "views" | "reportsCount">) => { success: boolean; error?: string };
  updateListing: (id: string, listingData: Partial<PhoneListing>) => void;
  deleteListing: (id: string) => void;
  featureListing: (id: string) => void;
  incrementViews: (id: string) => void;

  // Admin Bid Operations
  deleteBid: (id: string) => void;
  updateBidAmount: (id: string, amount: number) => void;

  // Bidding Operations
  placeBid: (listingId: string, amount: number) => { success: boolean; error?: string };
  buyNow: (listingId: string) => { success: boolean; error?: string };

  // Watchlist & Favorites
  toggleWatchlist: (listingId: string) => void;

  // Communication
  sendMessage: (receiverId: string, listingId: string, text: string) => void;
  getChatPartners: () => UserProfile[];
  getMessagesForChat: (partnerId: string) => ChatMessage[];

  // Feedback & Trust
  submitReport: (listingId: string, reason: string, details: string) => void;
  addShopReview: (shopId: string, rating: number, comment: string) => void;
  verifySeller: (userId: string) => void;
  verifyShop: (shopId: string) => void;

  // Pickup Verification
  verifyPickupCode: (listingId: string, code: string) => { success: boolean; error?: string };

  // Admin Actions
  resolveReport: (reportId: string, action: "delete_listing" | "dismiss") => void;
  blockUser: (userId: string) => void;

  // Notification Operations
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;

  // Extra filter states destructured by App.tsx
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brandFilter: string;
  batteryFilter: string;
  setBatteryFilter: (filter: string) => void;
  conditionFilter: string;
  setConditionFilter: (filter: string) => void;
  locationFilter: string;
  sortOption: string;
  setSortOption: (option: string) => void;
  simulateTimeTick: () => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ethio_phone_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  // Database core state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem("ethio_phone_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile[];
        const excludeNames = ["Dawit Kebede", "Almaz Tesfaye", "Tariku Bekele"];
        const excludeIds = ["user-shop-1", "user-shop-2", "user-seller-3"];
        const clean = parsed.filter(u => 
          !excludeNames.some(name => u.name.toLowerCase().includes(name.toLowerCase())) && 
          !excludeIds.includes(u.id)
        );
        if (clean.length !== parsed.length) {
          localStorage.setItem("ethio_phone_users", JSON.stringify(clean));
        }
        return clean.length > 0 ? clean : initialUsers;
      } catch (e) {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("ethio_phone_current_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        const excludeNames = ["Dawit Kebede", "Almaz Tesfaye", "Tariku Bekele"];
        const excludeIds = ["user-shop-1", "user-shop-2", "user-seller-3"];
        const isObsolete = excludeNames.some(name => parsed.name.toLowerCase().includes(name.toLowerCase())) || excludeIds.includes(parsed.id);
        if (!isObsolete) {
          return parsed;
        }
      } catch (e) {
        // Ignore and fallback
      }
    }
    // Default to the admin profile
    return initialUsers[0];
  });

  const [shops, setShops] = useState<ShopProfile[]>(() => {
    const saved = localStorage.getItem("ethio_phone_shops");
    return saved ? JSON.parse(saved) : initialShops;
  });

  const [listings, setListings] = useState<PhoneListing[]>(() => {
    const saved = localStorage.getItem("ethio_phone_listings");
    return saved ? JSON.parse(saved) : initialListings;
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    const saved = localStorage.getItem("ethio_phone_bids");
    return saved ? JSON.parse(saved) : initialBids;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("ethio_phone_messages");
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem("ethio_phone_reports");
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("ethio_phone_notifications");
    return saved ? JSON.parse(saved) : [
      {
        id: "notif-welcome",
        userId: "user-admin",
        title: "Welcome to ETPhone Auction!",
        message: "Your primary auction hub. Browse verified listings, check IMEI numbers, and place bids securely.",
        type: "general",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("ethio_phone_watchlist");
    return saved ? JSON.parse(saved) : ["listing-iphone15", "listing-iphone13"];
  });

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [activeTab, setActiveTab] = useState<string>("home");
  const [batteryFilter, setBatteryFilter] = useState<string>("All");
  const [conditionFilter, setConditionFilter] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("ending_soon");

  const brandFilter = selectedBrand || "All";
  const locationFilter = selectedRegion || "All";

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("ethio_phone_dark_mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_shops", JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_bids", JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("ethio_phone_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Realtime Simulation Loop: Countdowns, Expirations, and Rival Bids
  const simulateTimeTick = () => {
    const now = new Date();

    setListings((prevListings) => {
      let listingsChanged = false;
      const updated = prevListings.map((listing) => {
        const startTime = new Date(listing.startTime);
        const endTime = new Date(listing.endTime);

        // Manage status transitions based on timing
        let newStatus = listing.status;

        if (listing.status === AuctionStatus.UPCOMING && now >= startTime) {
          newStatus = AuctionStatus.LIVE;
          listingsChanged = true;
        } else if (listing.status === AuctionStatus.LIVE && now >= endTime) {
          // Find highest bid to see if anyone won
          const listingBids = bids.filter((b) => b.listingId === listing.id);
          if (listingBids.length > 0) {
            // Sort bids descending
            const sortedBids = [...listingBids].sort((a, b) => b.amount - a.amount);
            const topBid = sortedBids[0];

            // Set winner
            newStatus = AuctionStatus.ENDED;
            listing.winnerId = topBid.bidderId;

            // Setup pickup confirmation code (6-digits)
            const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
            listing.pickupCode = confirmationCode;

            // Notify the winner
            triggerNotification(
              topBid.bidderId,
              "🏆 Auction Won!",
              `You won the auction for ${listing.brand} ${listing.model} with a bid of ETB ${topBid.amount.toLocaleString()}. Collect at seller's shop: ${listing.sellerLocation.address}. Code: ${confirmationCode}`,
              "auction_won",
              listing.id
            );

            // Notify the seller
            triggerNotification(
              listing.sellerId,
              "🎉 Auction Completed!",
              `Your auction for ${listing.brand} ${listing.model} has ended. The winner is ${topBid.bidderName} (ETB ${topBid.amount.toLocaleString()}). Verification pickup code is active.`,
              "auction_ended",
              listing.id
            );
          } else {
            // Ended with no bids
            newStatus = AuctionStatus.ENDED;
            triggerNotification(
              listing.sellerId,
              "⏳ Auction Ended (No Bids)",
              `Your auction for ${listing.brand} ${listing.model} ended with no bids. You can relist this phone.`,
              "auction_ended",
              listing.id
            );
          }
          listingsChanged = true;
        }

        if (newStatus !== listing.status) {
          return { ...listing, status: newStatus, winnerId: listing.winnerId, pickupCode: listing.pickupCode };
        }
        return listing;
      });

      return listingsChanged ? updated : prevListings;
    });

    // Simulated Live Rival Bids
    const liveListings = listings.filter((l) => l.status === AuctionStatus.LIVE);
    if (liveListings.length > 0) {
      // Select random listing
      const target = liveListings[Math.floor(Math.random() * liveListings.length)];

      // Ensure it's not created by the active user (users don't bid on their own listings)
      if (target.sellerId !== currentUser.id) {
        const rivalNames = [
          "Binyam Worku",
          "Semere Teklay",
          "Hana Girma",
          "Michael Bekele",
          "Solomon Kebede",
          "Aster Teshome",
          "Girma Ayele"
        ];
        const rivalIds = ["rival-1", "rival-2", "rival-3", "rival-4", "rival-5", "rival-6"];
        const rIdx = Math.floor(Math.random() * rivalNames.length);

        const bidAmount = target.currentBid + target.minIncrement + (Math.random() > 0.5 ? target.minIncrement : 0);

        const newBid: Bid = {
          id: `sim-bid-${Date.now()}`,
          listingId: target.id,
          bidderId: rivalIds[rIdx % rivalIds.length],
          bidderName: rivalNames[rIdx],
          amount: bidAmount,
          timestamp: now.toISOString(),
          isAutoBid: Math.random() > 0.7
        };

        // Process the bid
        setBids((prevBids) => [...prevBids, newBid]);

        setListings((prevListings) =>
          prevListings.map((l) =>
            l.id === target.id ? { ...l, currentBid: bidAmount } : l
          )
        );

        // Check if active user was previously bidding on this and got outbid!
        const userBidsOnThis = bids.filter((b) => b.listingId === target.id && b.bidderId === currentUser.id);
        if (userBidsOnThis.length > 0) {
          triggerNotification(
            currentUser.id,
            "⚠️ Outbid Warning!",
            `You have been outbid on ${target.brand} ${target.model}. New high bid is ETB ${bidAmount.toLocaleString()} by ${rivalNames[rIdx]}!`,
            "outbid",
            target.id
          );
        }
      }
    }
  };

  const simulateTimeTickRef = useRef(simulateTimeTick);
  useEffect(() => {
    simulateTimeTickRef.current = simulateTimeTick;
  }, [simulateTimeTick]);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateTimeTickRef.current();
    }, 12000); // Trigger simulation every 12 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Authentication Switcher
  const switchUser = (userId: string) => {
    const foundUser = users.find((u) => u.id === userId);
    if (foundUser) {
      setCurrentUser(foundUser);
    }
  };

  const signOut = () => {
    setCurrentUser(guestUser);
    localStorage.removeItem("ethio_phone_current_user");
    setActiveTab("home");
  };

  const signupUser = (userData: {
    name: string;
    email: string;
    phone: string;
    location: {
      region: string;
      city: string;
      subCity: string;
      address: string;
    };
    role: UserRole;
  }) => {
    const newUserId = `user-${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      location: userData.location,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      reviewCount: 0,
      isVerifiedSeller: userData.role === UserRole.SHOP_OWNER,
      joinedDate: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // If they signed up as a shop owner, register their shop automatically
    if (userData.role === UserRole.SHOP_OWNER) {
      const newShopId = `shop-${Date.now()}`;
      const newShop: ShopProfile = {
        id: newShopId,
        ownerId: newUserId,
        name: `${userData.name}'s Smartphone Plaza`,
        logoUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=150&auto=format&fit=crop&q=80",
        description: `Premium, verified smart-devices store owned by ${userData.name}. High-quality inventory in ${userData.location.subCity}.`,
        phone: userData.phone,
        location: userData.location,
        rating: 5.0,
        isVerified: true, // Auto-verified for immediate testing
        reviews: []
      };
      setShops((prev) => [...prev, newShop]);
    }

    triggerNotification(
      newUserId,
      "🎉 Welcome to ETPhone Auction!",
      `Hello ${userData.name}, you have successfully signed up. ${
        userData.role === UserRole.SHOP_OWNER
          ? "You are signed up as a Shop Owner. You can list phones, view shop analytics, and access full administrative controls!"
          : "You are registered as a bidder. Browse listings, view seller locations, and place bids to join the auction!"
      }`,
      "general"
    );

    return newUser;
  };

  const updateProfile = (profileData: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...profileData } : u))
    );
    setCurrentUser((prev) => ({ ...prev, ...profileData }));
  };

  // Register physical shop for seller
  const registerShop = (shopData: Omit<ShopProfile, "id" | "ownerId" | "rating" | "reviews" | "isVerified">) => {
    const newShopId = `shop-${Date.now()}`;
    const newShop: ShopProfile = {
      ...shopData,
      id: newShopId,
      ownerId: currentUser.id,
      rating: 5.0,
      isVerified: false, // Requires Admin verification
      reviews: []
    };

    setShops((prev) => [...prev, newShop]);
    // Upgrade current user profile to shop owner if not admin
    if (currentUser.role !== UserRole.ADMIN) {
      updateProfile({ role: UserRole.SHOP_OWNER });
    }

    triggerNotification(
      currentUser.id,
      "🏪 Shop Registered",
      `Your shop "${shopData.name}" has been submitted for verification. An administrator will review your application soon.`,
      "general"
    );
  };

  // Create Listing with Fraud / IMEI checks
  const createListing = (listingData: Omit<PhoneListing, "id" | "sellerId" | "shopId" | "currentBid" | "status" | "isImeiVerified" | "createdAt" | "views" | "reportsCount">) => {
    if (currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "🚫 Unauthorized! Only the EthioPhone Admin has the rights to upload phone listings and images."
      };
    }

    // 1. Duplicate listing detection (IMEI checking)
    const activeImeiDuplicates = listings.filter(
      (l) => l.imei === listingData.imei && (l.status === AuctionStatus.LIVE || l.status === AuctionStatus.UPCOMING)
    );
    if (activeImeiDuplicates.length > 0) {
      return {
        success: false,
        error: "🚫 Duplicate Listing Detected! An active auction with the same IMEI number is already registered."
      };
    }

    // 2. Validate IMEI format (15 digits usually)
    const cleanImei = listingData.imei.replace(/\s+/g, "");
    if (!/^\d{15}$/.test(cleanImei)) {
      return {
        success: false,
        error: "❌ Invalid IMEI format. IMEI must be exactly 15 numeric digits."
      };
    }

    const listingId = `listing-${Date.now()}`;
    const userShop = shops.find((s) => s.ownerId === currentUser.id);

    // Is upcoming or live?
    const startTime = new Date(listingData.startTime);
    const now = new Date();
    const isLive = now >= startTime;

    const newListing: PhoneListing = {
      ...listingData,
      id: listingId,
      sellerId: currentUser.id,
      shopId: userShop?.id,
      currentBid: listingData.startingBid,
      status: isLive ? AuctionStatus.LIVE : AuctionStatus.UPCOMING,
      isImeiVerified: true, // Ethio Telecom verification mockup passed
      createdAt: now.toISOString(),
      views: 0,
      reportsCount: 0
    };

    setListings((prev) => [newListing, ...prev]);

    triggerNotification(
      currentUser.id,
      "🏷️ Listing Created",
      `Your auction for ${newListing.brand} ${newListing.model} is now ${newListing.status === AuctionStatus.LIVE ? "live" : "upcoming"}! IMEI ${newListing.imei} verified.`,
      "listing_approved",
      listingId
    );

    return { success: true };
  };

  const updateListing = (id: string, listingData: Partial<PhoneListing>) => {
    if (currentUser.role !== UserRole.ADMIN) {
      console.warn("Unauthorized listing edit attempt");
      return;
    }
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...listingData } : l))
    );
  };

  const deleteListing = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) {
      console.warn("Unauthorized listing delete attempt");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    setBids((prev) => prev.filter((b) => b.listingId !== id));
  };

  const deleteBid = (bidId: string) => {
    if (currentUser.role !== UserRole.ADMIN) {
      console.warn("Unauthorized delete bid attempt");
      return;
    }
    const bidToDelete = bids.find((b) => b.id === bidId);
    if (!bidToDelete) return;

    const listingId = bidToDelete.listingId;
    const remainingBids = bids.filter((b) => b.id !== bidId && b.listingId === listingId);

    setBids((prev) => prev.filter((b) => b.id !== bidId));

    // Update currentBid for the listing
    setListings((prevListings) =>
      prevListings.map((l) => {
        if (l.id === listingId) {
          if (remainingBids.length > 0) {
            const maxBid = Math.max(...remainingBids.map((b) => b.amount));
            return { ...l, currentBid: maxBid };
          } else {
            return { ...l, currentBid: l.startingBid };
          }
        }
        return l;
      })
    );
  };

  const updateBidAmount = (bidId: string, newAmount: number) => {
    if (currentUser.role !== UserRole.ADMIN) {
      console.warn("Unauthorized update bid attempt");
      return;
    }
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, amount: newAmount } : b))
    );

    // Re-calculate highest bid for that listing
    const updatedBid = bids.find((b) => b.id === bidId);
    if (updatedBid) {
      const listingId = updatedBid.listingId;
      setListings((prevListings) =>
        prevListings.map((l) => {
          if (l.id === listingId) {
            const listingBids = bids
              .map((b) => (b.id === bidId ? { ...b, amount: newAmount } : b))
              .filter((b) => b.listingId === listingId);
            if (listingBids.length > 0) {
              const maxBid = Math.max(...listingBids.map((b) => b.amount));
              return { ...l, currentBid: maxBid };
            } else {
              return { ...l, currentBid: l.startingBid };
            }
          }
          return l;
        })
      );
    }
  };

  const featureListing = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFeatured: !l.isFeatured } : l))
    );
  };

  const incrementViews = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l))
    );
  };

  // Place a Bid
  const placeBid = (listingId: string, amount: number) => {
    if (currentUser.id === "guest") {
      return { success: false, error: "Please sign in to place a bid on this device." };
    }
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: "Listing not found" };

    if (listing.status !== AuctionStatus.LIVE) {
      return { success: false, error: "Auction is not currently live" };
    }

    if (amount <= listing.currentBid) {
      return { success: false, error: `Bid must be higher than current bid (ETB ${listing.currentBid.toLocaleString()})` };
    }

    const minAcceptable = listing.currentBid + listing.minIncrement;
    if (amount < minAcceptable) {
      return { success: false, error: `Minimum bid increment is ETB ${listing.minIncrement.toLocaleString()}. Bid must be at least ETB ${minAcceptable.toLocaleString()}` };
    }

    if (listing.sellerId === currentUser.id) {
      return { success: false, error: "You cannot bid on your own phone auction." };
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      listingId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      timestamp: new Date().toISOString()
    };

    setBids((prev) => [...prev, newBid]);
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, currentBid: amount } : l))
    );

    // Watch list automatic addition when bidding
    if (!watchlist.includes(listingId)) {
      setWatchlist((prev) => [...prev, listingId]);
    }

    // Trigger notification to seller
    triggerNotification(
      listing.sellerId,
      "💰 New Bid Placed",
      `${currentUser.name} placed a bid of ETB ${amount.toLocaleString()} on your ${listing.brand} ${listing.model}!`,
      "bid_placed",
      listingId
    );

    return { success: true };
  };

  // Buy Now Feature
  const buyNow = (listingId: string) => {
    if (currentUser.id === "guest") {
      return { success: false, error: "Please sign in to buy this phone." };
    }
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: "Listing not found" };

    if (!listing.buyNowPrice) return { success: false, error: "Buy now not available for this listing" };

    if (listing.status !== AuctionStatus.LIVE) {
      return { success: false, error: "Auction is not currently live" };
    }

    if (listing.sellerId === currentUser.id) {
      return { success: false, error: "You cannot buy your own phone." };
    }

    const now = new Date();
    const finalAmount = listing.buyNowPrice;

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      listingId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount: finalAmount,
      timestamp: now.toISOString()
    };

    setBids((prev) => [...prev, newBid]);

    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? {
              ...l,
              currentBid: finalAmount,
              status: AuctionStatus.ENDED,
              winnerId: currentUser.id,
              pickupCode: confirmationCode
            }
          : l
      )
    );

    // Notify buyer
    triggerNotification(
      currentUser.id,
      "🏆 Bought It Now!",
      `You bought ${listing.brand} ${listing.model} instantly for ETB ${finalAmount.toLocaleString()}! Visit seller location to pick up. Code: ${confirmationCode}`,
      "auction_won",
      listingId
    );

    // Notify seller
    triggerNotification(
      listing.sellerId,
      "📦 Immediate Sale!",
      `${currentUser.name} bought your ${listing.brand} ${listing.model} using Buy Now for ETB ${finalAmount.toLocaleString()}! Pickup is pending.`,
      "auction_ended",
      listingId
    );

    return { success: true };
  };

  // Watchlist Favorites
  const toggleWatchlist = (listingId: string) => {
    setWatchlist((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  // Internal helper to shoot notification
  const triggerNotification = (
    userId: string,
    title: string,
    message: string,
    type: Notification["type"],
    listingId?: string
  ) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      listingId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Direct chat messaging
  const sendMessage = (receiverId: string, listingId: string, text: string) => {
    if (currentUser.id === "guest") return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      listingId,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const getChatPartners = (): UserProfile[] => {
    const partnerIds = new Set<string>();
    messages.forEach((m) => {
      if (m.senderId === currentUser.id) partnerIds.add(m.receiverId);
      if (m.receiverId === currentUser.id) partnerIds.add(m.senderId);
    });

    return users.filter((u) => partnerIds.has(u.id));
  };

  const getMessagesForChat = (partnerId: string): ChatMessage[] => {
    return messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  // Submitting reports
  const submitReport = (listingId: string, reason: string, details: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      listingId,
      listingTitle: `${listing.brand} ${listing.model}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reason,
      details,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setReports((prev) => [newReport, ...prev]);
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, reportsCount: l.reportsCount + 1 } : l))
    );
  };

  const addShopReview = (shopId: string, rating: number, comment: string) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      reviewerName: currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setShops((prevShops) =>
      prevShops.map((s) => {
        if (s.id === shopId) {
          const updatedReviews = [newReview, ...s.reviews];
          const average = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...s,
            reviews: updatedReviews,
            rating: parseFloat(average.toFixed(1))
          };
        }
        return s;
      })
    );
  };

  const verifySeller = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerifiedSeller: true } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, isVerifiedSeller: true }));
    }
    triggerNotification(userId, "✅ Account Verified", "Your account has been verified by the administrator. A verification badge has been added to your profile.", "general");
  };

  const verifyShop = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isVerified: true } : s))
    );
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      triggerNotification(shop.ownerId, "🏬 Shop Verified!", `Your shop "${shop.name}" has been fully verified. You now hold a Verified Shop Badge!`, "general");
    }
  };

  // In-person pickup validation (The Verification Code loop)
  const verifyPickupCode = (listingId: string, code: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: "Listing not found" };

    if (listing.sellerId !== currentUser.id) {
      return { success: false, error: "Only the seller can verify the pickup." };
    }

    if (listing.pickupCode !== code.trim()) {
      return { success: false, error: "Incorrect verification code. Please ask the buyer to show the correct 6-digit code." };
    }

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, status: AuctionStatus.COMPLETED } : l
      )
    );

    // Notify buyer
    if (listing.winnerId) {
      triggerNotification(
        listing.winnerId,
        "🤝 Pickup Completed!",
        `Your pickup for ${listing.brand} ${listing.model} has been verified by the seller. The transaction is complete. Thank you for using ETPhone!`,
        "pickup_verified",
        listingId
      );
    }

    // Notify seller
    triggerNotification(
      listing.sellerId,
      "💚 Transaction Completed!",
      `You successfully verified the pickup code. Your smartphone sale for ${listing.brand} ${listing.model} is now completed.`,
      "pickup_verified",
      listingId
    );

    return { success: true };
  };

  // Resolve admin report
  const resolveReport = (reportId: string, action: "delete_listing" | "dismiss") => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === "delete_listing") {
      deleteListing(report.listingId);
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
    );
  };

  const blockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        shops,
        listings,
        bids,
        messages,
        reports,
        notifications,
        watchlist,
        switchUser,
        signOut,
        signupUser,
        updateProfile,
        registerShop,
        createListing,
        updateListing,
        deleteListing,
        deleteBid,
        updateBidAmount,
        featureListing,
        incrementViews,
        placeBid,
        buyNow,
        toggleWatchlist,
        sendMessage,
        getChatPartners,
        getMessagesForChat,
        submitReport,
        addShopReview,
        verifySeller,
        verifyShop,
        verifyPickupCode,
        resolveReport,
        blockUser,
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
        activeTab,
        setActiveTab,
        brandFilter,
        batteryFilter,
        setBatteryFilter,
        conditionFilter,
        setConditionFilter,
        locationFilter,
        sortOption,
        setSortOption,
        simulateTimeTick,
        isDarkMode,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
