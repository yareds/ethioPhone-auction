/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserProfile, ShopProfile, PhoneListing, Bid, ChatMessage, Report, Notification, UserRole, AuctionStatus, PhoneCondition } from "../types";
import { initialUsers, initialShops, initialListings, initialBids, initialMessages, initialReports } from "../data/mockData";
import { 
  db, 
  auth, 
  googleProvider, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection 
} from "../lib/firebase";
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDocs 
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";

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
  signInWithGoogle: () => Promise<void>;
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

  // Database core state initialized with mockData defaults
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUsers[0]);
  const [shops, setShops] = useState<ShopProfile[]>(initialShops);
  const [listings, setListings] = useState<PhoneListing[]>(initialListings);
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [notifications, setNotifications] = useState<Notification[]>(() => [
    {
      id: "notif-welcome",
      userId: "user-admin",
      title: "Welcome to YONIPhone Auction!",
      message: "Your primary auction hub. Connected to Firebase Firestore backend.",
      type: "general",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [watchlist, setWatchlist] = useState<string[]>(() => ["listing-iphone15", "listing-iphone13"]);

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

  // 1. Firebase Initialization & Realtime Firestore Subscriptions
  useEffect(() => {
    testFirestoreConnection();

    // Listen to Firebase Auth state changes
    const unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Firebase User",
          email: fbUser.email || "",
          phone: fbUser.phoneNumber || "+251911000000",
          role: fbUser.email === "yared.abegaz@gmail.com" ? UserRole.ADMIN : UserRole.BUYER,
          location: {
            region: "Addis Ababa",
            city: "Addis Ababa",
            subCity: "Bole",
            address: "Bole Road"
          },
          photoUrl: fbUser.photoURL || undefined,
          rating: 5.0,
          reviewCount: 0,
          isVerifiedSeller: true,
          joinedDate: new Date().toISOString()
        };

        setCurrentUser(userProfile);

        // Upsert user to Firestore
        try {
          await setDoc(doc(db, "users", fbUser.uid), userProfile, { merge: true });
        } catch (err) {
          console.error("Error saving user to Firestore:", err);
        }
      }
    });

    // Subscribe to Firestore 'users'
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedUsers: UserProfile[] = [];
        snapshot.forEach((d) => fetchedUsers.push(d.data() as UserProfile));
        setUsers(fetchedUsers);
      } else {
        // Seed Firestore if empty
        initialUsers.forEach((u) => {
          setDoc(doc(db, "users", u.id), u).catch((e) => handleFirestoreError(e, OperationType.WRITE, "users"));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "users"));

    // Subscribe to Firestore 'shops'
    const unsubShops = onSnapshot(collection(db, "shops"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedShops: ShopProfile[] = [];
        snapshot.forEach((d) => fetchedShops.push(d.data() as ShopProfile));
        setShops(fetchedShops);
      } else {
        initialShops.forEach((s) => {
          setDoc(doc(db, "shops", s.id), s).catch((e) => handleFirestoreError(e, OperationType.WRITE, "shops"));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "shops"));

    // Subscribe to Firestore 'listings'
    const unsubListings = onSnapshot(collection(db, "listings"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedListings: PhoneListing[] = [];
        snapshot.forEach((d) => fetchedListings.push(d.data() as PhoneListing));
        setListings(fetchedListings);
      } else {
        initialListings.forEach((l) => {
          setDoc(doc(db, "listings", l.id), l).catch((e) => handleFirestoreError(e, OperationType.WRITE, "listings"));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "listings"));

    // Subscribe to Firestore 'bids'
    const unsubBids = onSnapshot(collection(db, "bids"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedBids: Bid[] = [];
        snapshot.forEach((d) => fetchedBids.push(d.data() as Bid));
        setBids(fetchedBids);
      } else {
        initialBids.forEach((b) => {
          setDoc(doc(db, "bids", b.id), b).catch((e) => handleFirestoreError(e, OperationType.WRITE, "bids"));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "bids"));

    // Subscribe to Firestore 'notifications'
    const unsubNotifs = onSnapshot(collection(db, "notifications"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedNotifs: Notification[] = [];
        snapshot.forEach((d) => fetchedNotifs.push(d.data() as Notification));
        setNotifications(fetchedNotifs);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "notifications"));

    // Subscribe to Firestore 'messages'
    const unsubMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedMsgs: ChatMessage[] = [];
        snapshot.forEach((d) => fetchedMsgs.push(d.data() as ChatMessage));
        setMessages(fetchedMsgs);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "messages"));

    // Subscribe to Firestore 'reports'
    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedReps: Report[] = [];
        snapshot.forEach((d) => fetchedReps.push(d.data() as Report));
        setReports(fetchedReps);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "reports"));

    return () => {
      unsubAuth();
      unsubUsers();
      unsubShops();
      unsubListings();
      unsubBids();
      unsubNotifs();
      unsubMessages();
      unsubReports();
    };
  }, []);

  // Theme LocalStorage Sync
  useEffect(() => {
    localStorage.setItem("ethio_phone_dark_mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Realtime Simulation Loop: Countdowns, Expirations
  const simulateTimeTick = () => {
    const now = new Date();

    setListings((prevListings) => {
      let listingsChanged = false;
      const updated = prevListings.map((listing) => {
        const startTime = new Date(listing.startTime);
        const endTime = new Date(listing.endTime);

        let newStatus = listing.status;

        if (listing.status === AuctionStatus.UPCOMING && now >= startTime) {
          newStatus = AuctionStatus.LIVE;
          listingsChanged = true;
        } else if (listing.status === AuctionStatus.LIVE && now >= endTime) {
          const listingBids = bids.filter((b) => b.listingId === listing.id);
          if (listingBids.length > 0) {
            const sortedBids = [...listingBids].sort((a, b) => b.amount - a.amount);
            const topBid = sortedBids[0];
            newStatus = AuctionStatus.ENDED;
            listing.winnerId = topBid.bidderId;

            const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
            listing.pickupCode = confirmationCode;

            triggerNotification(
              topBid.bidderId,
              "🏆 Auction Won!",
              `You won the auction for ${listing.brand} ${listing.model} with a bid of ETB ${topBid.amount.toLocaleString()}. Code: ${confirmationCode}`,
              "auction_won",
              listing.id
            );

            triggerNotification(
              listing.sellerId,
              "🎉 Auction Completed!",
              `Your auction for ${listing.brand} ${listing.model} has ended. Winner is ${topBid.bidderName}.`,
              "auction_ended",
              listing.id
            );
          } else {
            newStatus = AuctionStatus.ENDED;
            triggerNotification(
              listing.sellerId,
              "⏳ Auction Ended (No Bids)",
              `Your auction for ${listing.brand} ${listing.model} ended with no bids.`,
              "auction_ended",
              listing.id
            );
          }
          listingsChanged = true;
        }

        if (newStatus !== listing.status) {
          const updatedListing = { ...listing, status: newStatus };
          setDoc(doc(db, "listings", listing.id), updatedListing, { merge: true }).catch((e) =>
            handleFirestoreError(e, OperationType.UPDATE, `listings/${listing.id}`)
          );
          return updatedListing;
        }
        return listing;
      });

      return listingsChanged ? updated : prevListings;
    });
  };

  const simulateTimeTickRef = useRef(simulateTimeTick);
  useEffect(() => {
    simulateTimeTickRef.current = simulateTimeTick;
  }, [simulateTimeTick]);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateTimeTickRef.current();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Authentication Operations
  const switchUser = (userId: string) => {
    const foundUser = users.find((u) => u.id === userId);
    if (foundUser) {
      setCurrentUser(foundUser);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In failed:", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Sign-out error:", e);
    }
    setCurrentUser(guestUser);
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
      photoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      reviewCount: 0,
      isVerifiedSeller: userData.role === UserRole.SHOP_OWNER,
      joinedDate: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    setDoc(doc(db, "users", newUserId), newUser).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `users/${newUserId}`)
    );

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
        isVerified: true,
        reviews: []
      };
      setShops((prev) => [...prev, newShop]);
      setDoc(doc(db, "shops", newShopId), newShop).catch((e) =>
        handleFirestoreError(e, OperationType.WRITE, `shops/${newShopId}`)
      );
    }

    triggerNotification(
      newUserId,
      "🎉 Welcome to YONIPhone Auction!",
      `Hello ${userData.name}, you have successfully signed up on YONIPhone.`,
      "general"
    );

    return newUser;
  };

  const updateProfile = (profileData: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileData };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);

    setDoc(doc(db, "users", currentUser.id), updated, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`)
    );
  };

  const registerShop = (shopData: Omit<ShopProfile, "id" | "ownerId" | "rating" | "reviews" | "isVerified">) => {
    const newShopId = `shop-${Date.now()}`;
    const newShop: ShopProfile = {
      ...shopData,
      id: newShopId,
      ownerId: currentUser.id,
      rating: 5.0,
      isVerified: false,
      reviews: []
    };

    setShops((prev) => [...prev, newShop]);
    setDoc(doc(db, "shops", newShopId), newShop).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `shops/${newShopId}`)
    );

    if (currentUser.role !== UserRole.ADMIN) {
      updateProfile({ role: UserRole.SHOP_OWNER });
    }

    triggerNotification(
      currentUser.id,
      "🏪 Shop Registered",
      `Your shop "${shopData.name}" has been registered in Firestore database!`,
      "general"
    );
  };

  const createListing = (listingData: Omit<PhoneListing, "id" | "sellerId" | "shopId" | "currentBid" | "status" | "isImeiVerified" | "createdAt" | "views" | "reportsCount">) => {
    if (currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "🚫 Unauthorized! Only the YONIPhone Admin has authorization to list phones."
      };
    }

    const activeImeiDuplicates = listings.filter(
      (l) => l.imei === listingData.imei && (l.status === AuctionStatus.LIVE || l.status === AuctionStatus.UPCOMING)
    );
    if (activeImeiDuplicates.length > 0) {
      return {
        success: false,
        error: "🚫 Duplicate Listing Detected! An active auction with the same IMEI number exists."
      };
    }

    const cleanImei = listingData.imei.replace(/\s+/g, "");
    if (!/^\d{15}$/.test(cleanImei)) {
      return {
        success: false,
        error: "❌ Invalid IMEI format. IMEI must be exactly 15 numeric digits."
      };
    }

    const listingId = `listing-${Date.now()}`;
    const userShop = shops.find((s) => s.ownerId === currentUser.id);

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
      isImeiVerified: true,
      createdAt: now.toISOString(),
      views: 0,
      reportsCount: 0
    };

    setListings((prev) => [newListing, ...prev]);
    setDoc(doc(db, "listings", listingId), newListing).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `listings/${listingId}`)
    );

    triggerNotification(
      currentUser.id,
      "🏷️ Listing Created",
      `Your auction for ${newListing.brand} ${newListing.model} is now active on Firestore!`,
      "listing_approved",
      listingId
    );

    return { success: true };
  };

  const updateListing = (id: string, listingData: Partial<PhoneListing>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...listingData } : l))
    );
    setDoc(doc(db, "listings", id), listingData, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
    );
  };

  const deleteListing = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, "listings", id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `listings/${id}`)
    );
  };

  const deleteBid = (bidId: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBids((prev) => prev.filter((b) => b.id !== bidId));
    deleteDoc(doc(db, "bids", bidId)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `bids/${bidId}`)
    );
  };

  const updateBidAmount = (bidId: string, newAmount: number) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, amount: newAmount } : b))
    );
    updateDoc(doc(db, "bids", bidId), { amount: newAmount }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `bids/${bidId}`)
    );
  };

  const featureListing = (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const isFeatured = !listing.isFeatured;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFeatured } : l))
    );
    updateDoc(doc(db, "listings", id), { isFeatured }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
    );
  };

  const incrementViews = (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const views = listing.views + 1;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, views } : l))
    );
    updateDoc(doc(db, "listings", id), { views }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
    );
  };

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

    const newBidId = `bid-${Date.now()}`;
    const newBid: Bid = {
      id: newBidId,
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

    setDoc(doc(db, "bids", newBidId), newBid).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `bids/${newBidId}`)
    );
    updateDoc(doc(db, "listings", listingId), { currentBid: amount }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
    );

    if (!watchlist.includes(listingId)) {
      setWatchlist((prev) => [...prev, listingId]);
    }

    triggerNotification(
      listing.sellerId,
      "💰 New Bid Placed",
      `${currentUser.name} placed a bid of ETB ${amount.toLocaleString()} on your ${listing.brand} ${listing.model}!`,
      "bid_placed",
      listingId
    );

    return { success: true };
  };

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
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newBidId = `bid-${Date.now()}`;
    const newBid: Bid = {
      id: newBidId,
      listingId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount: finalAmount,
      timestamp: now.toISOString()
    };

    setBids((prev) => [...prev, newBid]);
    setDoc(doc(db, "bids", newBidId), newBid).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `bids/${newBidId}`)
    );

    const updatedListing = {
      currentBid: finalAmount,
      status: AuctionStatus.ENDED,
      winnerId: currentUser.id,
      pickupCode: confirmationCode
    };

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, ...updatedListing } : l))
    );

    updateDoc(doc(db, "listings", listingId), updatedListing).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
    );

    triggerNotification(
      currentUser.id,
      "🏆 Bought It Now!",
      `You bought ${listing.brand} ${listing.model} instantly for ETB ${finalAmount.toLocaleString()}! Code: ${confirmationCode}`,
      "auction_won",
      listingId
    );

    triggerNotification(
      listing.sellerId,
      "📦 Immediate Sale!",
      `${currentUser.name} bought your ${listing.brand} ${listing.model} using Buy Now for ETB ${finalAmount.toLocaleString()}!`,
      "auction_ended",
      listingId
    );

    return { success: true };
  };

  const toggleWatchlist = (listingId: string) => {
    setWatchlist((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const triggerNotification = (
    userId: string,
    title: string,
    message: string,
    type: Notification["type"],
    listingId?: string
  ) => {
    const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: Notification = {
      id: notifId,
      userId,
      title,
      message,
      type,
      listingId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setDoc(doc(db, "notifications", notifId), newNotif).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `notifications/${notifId}`)
    );
  };

  const sendMessage = (receiverId: string, listingId: string, text: string) => {
    if (currentUser.id === "guest") return;
    const msgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      senderId: currentUser.id,
      receiverId,
      listingId,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, newMsg]);
    setDoc(doc(db, "messages", msgId), newMsg).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `messages/${msgId}`)
    );
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

  const submitReport = (listingId: string, reason: string, details: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const repId = `rep-${Date.now()}`;
    const newReport: Report = {
      id: repId,
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
    setDoc(doc(db, "reports", repId), newReport).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `reports/${repId}`)
    );

    const reportsCount = listing.reportsCount + 1;
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, reportsCount } : l))
    );
    updateDoc(doc(db, "listings", listingId), { reportsCount }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
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
          const average = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
          const updatedShop = { ...s, reviews: updatedReviews, rating: average };
          setDoc(doc(db, "shops", shopId), updatedShop, { merge: true }).catch((e) =>
            handleFirestoreError(e, OperationType.UPDATE, `shops/${shopId}`)
          );
          return updatedShop;
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
    updateDoc(doc(db, "users", userId), { isVerifiedSeller: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`)
    );
    triggerNotification(userId, "✅ Account Verified", "Your account has been verified by administrator.", "general");
  };

  const verifyShop = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isVerified: true } : s))
    );
    updateDoc(doc(db, "shops", shopId), { isVerified: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `shops/${shopId}`)
    );
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      triggerNotification(shop.ownerId, "🏬 Shop Verified!", `Your shop "${shop.name}" has been fully verified.`, "general");
    }
  };

  const verifyPickupCode = (listingId: string, code: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: "Listing not found" };

    if (listing.sellerId !== currentUser.id) {
      return { success: false, error: "Only the seller can verify the pickup." };
    }

    if (listing.pickupCode !== code.trim()) {
      return { success: false, error: "Incorrect verification code. Please ask buyer for 6-digit code." };
    }

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: AuctionStatus.COMPLETED } : l))
    );
    updateDoc(doc(db, "listings", listingId), { status: AuctionStatus.COMPLETED }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
    );

    if (listing.winnerId) {
      triggerNotification(
        listing.winnerId,
        "🤝 Pickup Completed!",
        `Pickup for ${listing.brand} ${listing.model} has been verified by the seller!`,
        "pickup_verified",
        listingId
      );
    }

    triggerNotification(
      listing.sellerId,
      "💚 Transaction Completed!",
      `You successfully verified pickup for ${listing.brand} ${listing.model}.`,
      "pickup_verified",
      listingId
    );

    return { success: true };
  };

  const resolveReport = (reportId: string, action: "delete_listing" | "dismiss") => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === "delete_listing") {
      deleteListing(report.listingId);
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
    );
    updateDoc(doc(db, "reports", reportId), { status: "resolved" }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `reports/${reportId}`)
    );
  };

  const blockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u))
    );
    updateDoc(doc(db, "users", userId), { isBlocked: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`)
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    updateDoc(doc(db, "notifications", id), { isRead: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`)
    );
  };

  const clearNotifications = () => {
    notifications
      .filter((n) => n.userId === currentUser.id && !n.isRead)
      .forEach((n) => markNotificationRead(n.id));
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
        signInWithGoogle,
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
