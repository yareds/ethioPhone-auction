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

    </div>
  );
}
