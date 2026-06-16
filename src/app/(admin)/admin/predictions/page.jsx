"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLoader2, TbSearch, TbTrash, TbAlertCircle, TbLeaf,
  TbMapPin, TbCalendar, TbChartBar, TbBuildingCommunity,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

const AGRI_API = "https://agriwatch-backenf.onrender.com";

const agriGet = async (path) => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = raw && raw !== "undefined" && raw !== "null" ? raw : null;
  const res = await fetch(`${AGRI_API}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
};

const formatDisease = (name = "") =>
  name.replace(/^Potato___/, "").replace(/___/g, " – ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const diseaseBadgeColor = (name = "") => {
  const n = (name || "").toLowerCase();
  if (n.includes("healthy")) return "bg-green-100 text-green-700";
  if (n.includes("late")) return "bg-red-100 text-red-700";
  if (n.includes("early")) return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

export default function PredictionsPage() {
  const [districtStats, setDistrictStats] = useState([]);
  const [topDistricts, setTopDistricts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Top districts
  const [mostAffected, setMostAffected] = useState(null);

  // District breakdown drill-down
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

    if (statsRes.status === "fulfilled") {
      setDistrictStats(statsRes.value?.data || []);
    } else {
      console.error("district-stats:", statsRes.reason?.message);
    }
    if (topRes.status === "fulfilled") {
      const d = topRes.value;
      setMostAffected(d?.mostAffected || null);
      setTopDistricts(d?.data || []);
    } else {
      console.error("top-districts:", topRes.reason?.message);
    }
    if (predsRes.status === "fulfilled") {
      const d = predsRes.value;
      const list = d?.data || d?.results || d?.predictions || (Array.isArray(d) ? d : []);
      setPredictions(list);
      if (list[0]) console.log("prediction record sample:", list[0]);
    } else {
      console.error("all-results:", predsRes.reason?.message);
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
    } catch (e) {
      toast.error(`Failed to load breakdown for ${district}`);
      setBreakdown([]);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const raw = localStorage.getItem("token");
      const token = raw && raw !== "undefined" ? raw : null;
      const res = await fetch(`${AGRI_API}/predict/delete-all-results`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("All prediction records cleared");
      setPredictions([]);
      setDistrictStats([]);
      setTopDistricts([]);
      setShowDeleteAll(false);
    } catch {
      toast.error("Failed to delete records");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCases = districtStats.reduce((s, d) => s + (d.totalCases || 0), 0);
  const maxCases = Math.max(...districtStats.map((d) => d.totalCases || 0), 1);
  const lateBlightCount = predictions.filter((p) => p.isLateBlight).length;
  const healthyCount = predictions.filter((p) => !p.isLateBlight).length;

  const filteredPreds = predictions.filter((p) => {
    const q = search.toLowerCase();
    const result = (p.data?.result?.en || "").toLowerCase();
    const district = (p.location?.district || "").toLowerCase();
    const sector = (p.location?.sector || "").toLowerCase();
    return result.includes(q) || district.includes(q) || sector.includes(q);
  });

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Scans",        value: loading ? "..." : predictions.length, icon: TbChartBar,    color: "bg-blue-500"  },
          { label: "Late Blight",        value: loading ? "..." : lateBlightCount,    icon: TbAlertCircle, color: "bg-red-500"   },
          { label: "Healthy",            value: loading ? "..." : healthyCount,        icon: TbLeaf,        color: "bg-green-500" },
          { label: "Districts Affected", value: loading ? "..." : districtStats.length,icon: TbMapPin,      color: "bg-primary"   },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-full text-white ${s.color}`}><s.icon size={20} /></div>
                <div>
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Most Affected District Banner */}
      {!loading && mostAffected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <TbAlertCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-0.5">Most Affected District</p>
              <h3 className="text-2xl font-bold">{mostAffected.district}</h3>
              <p className="text-sm text-white/80">{mostAffected.province} Province</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-bold">{mostAffected.totalCases}</div>
            <div className="text-xs text-white/70 font-medium uppercase tracking-wide">Late Blight Cases</div>
          </div>
        </motion.div>
      )}

      {/* Top Districts Ranking */}
      {!loading && topDistricts.length > 0 && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TbChartBar size={18} /> Top Affected Districts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDistricts.map((d, i) => {
                const max = topDistricts[0]?.totalCases || 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => openBreakdown(d.district)}
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-primary group-hover:underline underline-offset-2">
                          {d.district}
                          <span className="text-xs font-normal text-muted-foreground ml-1.5">({d.province})</span>
                        </span>
                        <span className="text-xs font-bold text-red-500">{d.totalCases} cases</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (d.totalCases / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* District Stats Table */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TbBuildingCommunity size={18} /> Late Blight – District Level Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><TbLoader2 className="animate-spin text-primary" size={26} /></div>
          ) : districtStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No district data available</p>
          ) : (
            <div className="space-y-4">
              {districtStats.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openBreakdown(d.district)}
                  className="p-4 rounded-xl border border-border hover:bg-muted/20 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-primary group-hover:underline underline-offset-2">{d.district}</span>
                      <span className="text-xs text-muted-foreground ml-2">({d.province})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-red-500">{d.totalCases} case{d.totalCases !== 1 ? "s" : ""}</span>
                      <span className="text-xs text-primary/60 font-medium group-hover:text-primary transition-colors">View breakdown →</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (d.totalCases / maxCases) * 100)}%` }}
                    />
                  </div>
                  {d.sectors?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.sectors.map((s, j) => (
                        <span key={j} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Scan Results */}
      {predictions.length > 0 && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">All Scan Results</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search result, district, sector..."
                  className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/40 w-56"
                />
              </div>
              <button
                onClick={() => setShowDeleteAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TbTrash size={15} /> Clear All
              </button>
            </div>
          </CardHeader>
          <CardContent>
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
                    {filteredPreds.map((p, i) => {
                      const result = p.data?.result?.en || "Unknown";
                      const severity = p.data?.severity?.en || "—";
                      const percentage = p.data?.percentage || "—";
                      const isLateBlight = p.isLateBlight;
                      const district = p.location?.district || "—";
                      const sector = p.location?.sector || "";
                      return (
                        <motion.tr
                          key={p._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-muted/20"
                        >
                          <td className="py-3 pr-4">
                            {p.image?.url ? (
                              <img
                                src={p.image.url}
                                alt="scan"
                                className="w-10 h-10 rounded-lg object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <TbLeaf size={16} className="text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isLateBlight ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {isLateBlight ? "Late Blight" : "Healthy"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground font-medium">{percentage}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold ${isLateBlight ? "text-red-600" : "text-green-600"}`}>
                              {severity}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TbMapPin size={13} />
                              <span>{district}{sector ? `, ${sector}` : ""}</span>
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <TbCalendar size={13} />
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* District Breakdown Modal */}
      <AnimatePresence>
        {breakdownDistrict && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-primary">Sector Breakdown</h3>
                  <p className="text-sm text-muted-foreground">{breakdownDistrict} District</p>
                </div>
                <button
                  onClick={() => { setBreakdownDistrict(""); setBreakdown(null); }}
                  className="text-muted-foreground hover:text-primary transition-colors text-xl leading-none"
                >✕</button>
              </div>

              {breakdownLoading ? (
                <div className="flex justify-center py-10"><TbLoader2 className="animate-spin text-primary" size={26} /></div>
              ) : breakdown?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No breakdown data for this district</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {breakdown?.map((s, i) => {
                    const maxSector = Math.max(...(breakdown.map(b => b.totalCases || 0)), 1);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl border border-border"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-primary text-sm">{s.sector}</span>
                          <span className="text-xs font-bold text-red-500">{s.totalCases} case{s.totalCases !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (s.totalCases / maxSector) * 100)}%` }}
                          />
                        </div>
                        {s.cells?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.cells.map((c, j) => (
                              <span key={j} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{c}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => { setBreakdownDistrict(""); setBreakdown(null); }}
                className="mt-5 w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Modal */}
      <AnimatePresence>
        {showDeleteAll && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TbAlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Clear All Records</h3>
              <p className="text-muted-foreground text-sm mb-6">
                This will permanently delete all {predictions.length} prediction records. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteAll(false)} disabled={isDeleting}
                  className="flex-1 py-2.5 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleDeleteAll} disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? <><TbLoader2 className="animate-spin" size={16} />Deleting...</> : <><TbTrash size={16} />Delete All</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
