/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole, Report, ShopProfile } from "../types";
import { Shield, Users, ShoppingBag, ShieldAlert, Check, Ban, X, Sparkles, TrendingUp, AlertOctagon } from "lucide-react";

export default function AdminPanel() {
  const {
    users,
    shops,
    listings,
    reports,
    verifySeller,
    verifyShop,
    resolveReport,
    blockUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<"stats" | "users" | "shops" | "reports">("stats");

  // High level metrics
  const activeUsersCount = users.filter((u) => !u.isBlocked).length;
  const verifiedShopsCount = shops.filter((s) => s.isVerified).length;
  const unverifiedShops = shops.filter((s) => !s.isVerified);
  const pendingReports = reports.filter((r) => r.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Title bar banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-sans font-black text-2xl tracking-tight">EthioPhone Admin Workspace</h1>
            <p className="text-xs text-red-100 mt-1">Platform Moderator clearance. Review and approve sellers, inspect reported IMEI clones, and monitor server operations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 border border-gray-150 dark:border-gray-800 space-y-1">
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "stats"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5" /> Platform Analytics
              </span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5" /> Manage Users ({users.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("shops")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "shops"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5" /> Verify Shops
              </span>
              {unverifiedShops.length > 0 && (
                <span className="bg-amber-500 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                  {unverifiedShops.length} Request
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "reports"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" /> Community Reports
              </span>
              {pendingReports.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                  {pendingReports.length} Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT PANEL */}
        <div className="lg:col-span-9 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6">
          
          {/* TAB: PLATFORM ANALYTICS */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white">Addis Ababa Auction Metrics</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total Users</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{users.length}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Registered Shops</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{shops.length}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Active Auctions</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {listings.filter((l) => l.status === "live").length}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Reports Flagged</p>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{reports.length}</p>
                </div>
              </div>

              {/* Fraud Detection Analysis mock */}
              <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl border border-slate-800">
                <h4 className="text-yellow-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4" /> System AI Security Status (Anti-Fraud Guard)
                </h4>
                <ul className="text-xs space-y-2.5 leading-relaxed font-sans mt-3 text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span><strong>IMEI validation engine:</strong> ACTIVE. Restricting listings to 15 numeric digits.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span><strong>Duplicate listings check:</strong> ACTIVE. Blocked 3 duplicate IMEIs in the last 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span><strong>Verified physical shops:</strong> 100% of shop sellers verified against local registry papers.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: MANAGE USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white">User Accounts Manager</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                  <thead>
                    <tr className="text-gray-400 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email / Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <img
                            src={u.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                            alt={u.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-gray-400">{u.location.city}, {u.location.subCity}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-400">
                          <p>{u.email}</p>
                          <p className="mt-0.5">{u.phone}</p>
                        </td>

                        <td className="py-3.5 px-4 font-bold uppercase text-[10px] text-slate-500">
                          {u.role.replace("_", " ")}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isBlocked ? (
                            <span className="bg-red-100 text-red-700 dark:bg-red-950 px-2 py-0.5 rounded font-black uppercase text-[9px]">
                              Blocked
                            </span>
                          ) : u.isVerifiedSeller ? (
                            <span className="bg-green-100 text-green-700 dark:bg-green-950 px-2 py-0.5 rounded font-black uppercase text-[9px]">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 px-2 py-0.5 rounded font-black uppercase text-[9px]">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {!u.isVerifiedSeller && u.role !== UserRole.ADMIN && (
                            <button
                              onClick={() => verifySeller(u.id)}
                              className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 hover:bg-green-100 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                              id={`verify-seller-${u.id}`}
                            >
                              Verify Account
                            </button>
                          )}
                          {!u.isBlocked && u.role !== UserRole.ADMIN && (
                            <button
                              onClick={() => blockUser(u.id)}
                              className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 px-2.5 py-1 rounded-lg text-[10px] font-bold"
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
              <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white">Shop Verification Applications</h3>
              
              {unverifiedShops.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Check className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">All shops are verified</p>
                  <p className="text-xs text-gray-500 mt-1">There are no pending shop applications currently.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unverifiedShops.map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={shop.logoUrl}
                          alt={shop.name}
                          className="h-12 w-12 rounded-xl object-cover border border-gray-100 dark:border-gray-700 bg-white"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">{shop.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{shop.location.address}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{shop.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => verifyShop(shop.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm"
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
              <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white">Community Moderator Queue</h3>
              
              {pendingReports.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Check className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">Reports queue is clean</p>
                  <p className="text-xs text-gray-500 mt-1">No pending reports require actions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="border border-red-100 dark:border-red-950 p-4 rounded-2xl bg-red-50/20 dark:bg-red-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            {rep.reason}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            Reported by: {rep.reporterName}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white pt-1">
                          Flagged Device: {rep.listingTitle}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-800/30 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                          "{rep.details}"
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                        <button
                          onClick={() => resolveReport(rep.id, "dismiss")}
                          className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                          id={`dismiss-report-${rep.id}`}
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolveReport(rep.id, "delete_listing")}
                          className="flex-1 md:flex-initial bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
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

    </div>
  );
}
