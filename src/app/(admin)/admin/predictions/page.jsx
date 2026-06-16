"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLoader2, TbSearch, TbTrash, TbAlertCircle, TbLeaf,
  TbMapPin, TbCalendar, TbChartBar, TbShieldCheck, TbX,
  TbPhoto, TbRefresh,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

const AGRI_API = "https://agriwatch-backenf.onrender.com";

const agriGet = async (path) => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = raw && raw !== "undefined" && raw !== "null" ? raw : null;
  const res = await fetch(`${AGRI_API}${path}`, {
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

const agriDelete = async (path) => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = raw && raw !== "undefined" && raw !== "null" ? raw : null;
  const res = await fetch(`${AGRI_API}${path}`, {
    method: "DELETE",
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed");
  return data;
};

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <Card className="border-none shadow-sm bg-white h-full">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-2xl text-white shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-primary">{loading ? "..." : value}</div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>
    </CardContent>
  </Card>
);

export default function PredictionsPage() {
  const [districtStats, setDistrictStats] = useState([]);
  const [topDistricts, setTopDistricts] = useState([]);
  const [mostAffected, setMostAffected] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [breakdownDistrict, setBreakdownDistrict] = useState("");
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [statsRes, topRes, predsRes] = await Promise.allSettled([
      agriGet("/predict/district-stats"),
      agriGet("/predict/top-districts"),
      agriGet("/predict/all-results"),
    ]);
    if (statsRes.status === "fulfilled") setDistrictStats(statsRes.value?.data || []);
    if (topRes.status === "fulfilled") {
      setMostAffected(topRes.value?.mostAffected || null);
      setTopDistricts(topRes.value?.data || []);
    }
    if (predsRes.status === "fulfilled") {
      setPredictions(predsRes.value?.data || []);
    }
    setLoading(false);
  };

  const openBreakdown = async (district) => {
    setBreakdownDistrict(district);
    setBreakdown(null);
    setBreakdownLoading(true);
    try {
      const res = await agriGet(`/predict/district-breakdown/${encodeURIComponent(district)}`);
      setBreakdown(res.data || []);
    } catch {
      toast.error(`Could not load breakdown for ${district}`);
      setBreakdown([]);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const res = await agriDelete("/predict/delete-all-results");
      toast.success(res.message || "All prediction records cleared");
      setPredictions([]);
      setDistrictStats([]);
      setTopDistricts([]);
      setMostAffected(null);
      setShowDeleteAll(false);
    } catch (e) {
      toast.error(e.message || "Failed to delete records");
    } finally {
      setIsDeleting(false);
    }
  };

  const lateBlightCount = predictions.filter((p) => p.isLateBlight).length;
  const healthyCount = predictions.filter((p) => !p.isLateBlight).length;
  const maxCases = Math.max(...districtStats.map((d) => d.totalCases || 0), 1);
  const maxTop = Math.max(...topDistricts.map((d) => d.totalCases || 0), 1);

  const filtered = predictions.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.data?.result?.en || "").toLowerCase().includes(q) ||
      (p.location?.district || "").toLowerCase().includes(q) ||
      (p.location?.sector || "").toLowerCase().includes(q) ||
      (p.data?.severity?.en || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Scans"        value={predictions.length}  icon={TbChartBar}    color="bg-blue-500"   loading={loading} />
        <StatCard label="Late Blight Detected" value={lateBlightCount}   icon={TbAlertCircle} color="bg-red-500"    loading={loading} />
        <StatCard label="Healthy Plants"     value={healthyCount}         icon={TbShieldCheck} color="bg-green-500"  loading={loading} />
        <StatCard label="Districts Affected" value={districtStats.length} icon={TbMapPin}      color="bg-primary"    loading={loading} />
      </div>

      {/* ── Most Affected Banner ── */}
      {!loading && mostAffected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-red-500 to-rose-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <TbAlertCircle size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-1">Most Affected District</p>
              <h3 className="text-3xl font-extrabold leading-none">{mostAffected.district}</h3>
              <p className="text-sm text-white/75 mt-1">{mostAffected.province} Province</p>
            </div>
          </div>
          <div className="sm:text-right pl-18 sm:pl-0">
            <div className="text-5xl font-extrabold">{mostAffected.totalCases}</div>
            <div className="text-xs text-white/60 font-semibold uppercase tracking-widest mt-1">Late Blight Cases</div>
          </div>
        </motion.div>
      )}

      {/* ── Top Districts + District Stats side-by-side on lg ── */}
      {!loading && (topDistricts.length > 0 || districtStats.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Districts Ranking */}
          {topDistricts.length > 0 && (
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <TbChartBar size={17} className="text-primary" /> Top Affected Districts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topDistricts.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => openBreakdown(d.district)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-primary group-hover:underline underline-offset-2">
                          {d.district}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({d.province})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-500">{d.totalCases} cases</span>
                        <span className="text-[10px] text-primary/50 group-hover:text-primary transition-colors">→</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (d.totalCases / maxTop) * 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        className="bg-red-500 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* District Level Stats */}
          {districtStats.length > 0 && (
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <TbMapPin size={17} className="text-primary" /> District-Level Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {districtStats.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => openBreakdown(d.district)}
                    className="p-3 rounded-xl border border-border hover:border-red-200 hover:bg-red-50/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-primary group-hover:text-red-600 transition-colors">{d.district}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">· {d.province}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-500">{d.totalCases} cases</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-red-500 transition-colors">View →</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (d.totalCases / maxCases) * 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        className="bg-red-500 h-1.5 rounded-full"
                      />
                    </div>
                    {d.sectors?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {d.sectors.map((s, j) => (
                          <span key={j} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── All Scan Results Table ── */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
          <div>
            <CardTitle className="text-base">All Scan Results</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{loading ? "Loading..." : `${predictions.length} total records`}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search result, district, sector..."
                className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
              />
            </div>
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary border border-border rounded-lg hover:bg-muted/40 transition-colors"
            >
              <TbRefresh size={15} /> Refresh
            </button>
            {predictions.length > 0 && (
              <button
                onClick={() => setShowDeleteAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TbTrash size={15} /> Clear All
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <TbLoader2 className="animate-spin text-primary" size={30} />
              <p className="text-sm">Loading scan results...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <TbLeaf size={44} className="opacity-20" />
              <p className="text-sm font-medium">No scan records found</p>
              {search && <p className="text-xs">Try clearing the search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 pr-4 font-semibold">Image</th>
                    <th className="pb-3 pr-4 font-semibold">Result</th>
                    <th className="pb-3 pr-4 font-semibold">Confidence</th>
                    <th className="pb-3 pr-4 font-semibold">Severity</th>
                    <th className="pb-3 pr-4 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filtered.map((p, i) => {
                      const isLateBlight = p.isLateBlight;
                      const result = p.data?.result?.en || "—";
                      const severity = p.data?.severity?.en || "—";
                      const percentage = p.data?.percentage || "—";
                      const district = p.location?.district || "—";
                      const sector = p.location?.sector;
                      return (
                        <motion.tr
                          key={p._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="py-3 pr-4">
                            {p.image?.url ? (
                              <img
                                src={p.image.url}
                                alt={p.image.originalName || "scan"}
                                className="w-11 h-11 rounded-xl object-cover border border-border shadow-sm"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                                <TbPhoto size={18} className="text-muted-foreground" />
                              </div>
                            )}
                          </td>

                          {/* Result badge */}
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isLateBlight
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {isLateBlight ? <TbAlertCircle size={12} /> : <TbShieldCheck size={12} />}
                              {isLateBlight ? "Late Blight" : "Healthy"}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td className="py-3 pr-4">
                            <span className="font-semibold text-primary">{percentage}</span>
                          </td>

                          {/* Severity */}
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium ${
                              isLateBlight ? "text-red-600" : "text-green-600"
                            }`}>
                              {severity}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3 pr-4">
                            <div className="flex items-start gap-1 text-muted-foreground">
                              <TbMapPin size={13} className="mt-0.5 shrink-0" />
                              <div>
                                <div className="font-medium text-primary text-xs">{district}</div>
                                {sector && <div className="text-[11px] text-muted-foreground">{sector}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1 text-xs">
                              <TbCalendar size={13} />
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                : "—"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── District Breakdown Modal ── */}
      <AnimatePresence>
        {breakdownDistrict && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-primary">Sector Breakdown</h3>
                  <p className="text-sm text-muted-foreground">{breakdownDistrict} District — Late Blight by sector</p>
                </div>
                <button
                  onClick={() => { setBreakdownDistrict(""); setBreakdown(null); }}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <TbX size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {breakdownLoading ? (
                  <div className="flex justify-center py-10">
                    <TbLoader2 className="animate-spin text-primary" size={26} />
                  </div>
                ) : !breakdown || breakdown.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                    <TbMapPin size={36} className="opacity-20" />
                    <p className="text-sm">No sector data for this district</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(() => {
                      const maxSector = Math.max(...breakdown.map((b) => b.totalCases || 0), 1);
                      return breakdown.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="p-4 rounded-xl border border-border bg-muted/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-primary">{s.sector}</span>
                            <span className="text-sm font-bold text-red-500">
                              {s.totalCases} case{s.totalCases !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-2.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (s.totalCases / maxSector) * 100)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.06 }}
                              className="bg-red-500 h-2 rounded-full"
                            />
                          </div>
                          {s.cells?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[10px] text-muted-foreground font-medium mr-1">Cells:</span>
                              {s.cells.map((c, j) => (
                                <span key={j} className="px-2 py-0.5 bg-white border border-border text-muted-foreground text-[10px] rounded-full">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => { setBreakdownDistrict(""); setBreakdown(null); }}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete All Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteAll && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <TbTrash size={30} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Clear All Records?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                This will permanently delete all <span className="font-bold text-primary">{predictions.length}</span> prediction records from the database. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAll(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                >
                  {isDeleting
                    ? <><TbLoader2 className="animate-spin" size={16} /> Deleting...</>
                    : <><TbTrash size={16} /> Delete All</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
