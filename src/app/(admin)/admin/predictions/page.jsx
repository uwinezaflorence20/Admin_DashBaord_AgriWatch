"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLoader2, TbSearch, TbTrash, TbAlertCircle, TbLeaf,
  TbMapPin, TbCalendar, TbChartBar, TbX,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAllPredictions, deleteAllPredictions, getTopDistricts, getDistrictStats } from "@/lib/api";
import { toast } from "sonner";

const getField = (p, ...keys) => {
  for (const k of keys) {
    const val = k.split(".").reduce((o, part) => o?.[part], p);
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return null;
};

const formatDisease = (name = "") =>
  name.replace(/^Potato___/, "").replace(/___/g, " - ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const diseaseBadgeColor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("healthy")) return "bg-green-100 text-green-700";
  if (n.includes("late")) return "bg-red-100 text-red-700";
  if (n.includes("early")) return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [topDistricts, setTopDistricts] = useState([]);
  const [districtStats, setDistrictStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [predsResult, topResult, statsResult] = await Promise.allSettled([
      getAllPredictions(),
      getTopDistricts(),
      getDistrictStats(),
    ]);

    if (predsResult.status === "fulfilled") {
      const raw = predsResult.value;
      console.log("RAW predictions response:", JSON.stringify(raw, null, 2));
      const list = raw?.data || raw?.results || raw?.predictions || (Array.isArray(raw) ? raw : []);
      if (list.length > 0) console.log("First prediction record keys:", Object.keys(list[0]));
      setPredictions(list);
    }
    if (topResult.status === "fulfilled") {
      const d = topResult.value;
      setTopDistricts(d?.data || d?.districts || []);
    }
    if (statsResult.status === "fulfilled") {
      setDistrictStats(statsResult.value?.data || statsResult.value || []);
    }
    setLoading(false);
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllPredictions();
      toast.success("All prediction records cleared");
      setPredictions([]);
      setTopDistricts([]);
      setDistrictStats([]);
      setShowDeleteAll(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete records");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDisease = (p) => getField(p, "disease", "result", "prediction", "label", "Disease", "Prediction", "Label") || "";
  const getConfidence = (p) => getField(p, "confidence", "Confidence", "probability", "score", "accuracy");
  const getUser = (p) => p.userId || p.user || p.User || null;
  const getFarmerName = (p) => {
    const u = getUser(p);
    if (!u) return "";
    return getField(u, "FirstName", "firstName", "name", "Name", "fullName") + " " +
           (getField(u, "LastName", "lastName", "surname") || "");
  };
  const getDistrict = (p) => {
    const u = getUser(p);
    return getField(p, "district", "District") ||
           getField(u, "location.district", "District", "district") || "";
  };

  const filtered = predictions.filter((p) => {
    const q = search.toLowerCase();
    return formatDisease(getDisease(p)).toLowerCase().includes(q) ||
           getDistrict(p).toLowerCase().includes(q) ||
           getFarmerName(p).toLowerCase().includes(q);
  });

  const diseaseCount = predictions.reduce((acc, p) => {
    const d = formatDisease(getDisease(p)) || "Unknown";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const topDisease = Object.entries(diseaseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Scans", value: loading ? "..." : predictions.length, color: "bg-primary", icon: TbLeaf },
          { label: "Most Common Disease", value: loading ? "..." : (topDisease || "—"), color: "bg-orange-500", icon: TbAlertCircle },
          { label: "Districts Affected", value: loading ? "..." : districtStats.length, color: "bg-blue-500", icon: TbMapPin },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-full text-white ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary truncate max-w-[160px]">{s.value}</div>
                  <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Districts */}
      {topDistricts.length > 0 && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TbChartBar size={18} /> Top Affected Districts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDistricts.slice(0, 5).map((d, i) => {
                const label = d.district || d._id || d.name || d.District || "Unknown";
                const count = d.count || d.total || d.cases || d.Total || 0;
                const max = topDistricts[0]?.count || topDistricts[0]?.total || topDistricts[0]?.cases || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary w-28 truncate">{label}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (count / max) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Results Table */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">All Scan Results</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search disease, district, farmer..."
                className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/40 w-56"
              />
            </div>
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
            <div className="flex justify-center py-16"><TbLoader2 className="animate-spin text-primary" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-2">
              <TbLeaf size={40} className="opacity-30" />
              <p className="text-sm">No prediction records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 pr-4 font-semibold">Disease</th>
                    <th className="pb-3 pr-4 font-semibold">Confidence</th>
                    <th className="pb-3 pr-4 font-semibold">Farmer</th>
                    <th className="pb-3 pr-4 font-semibold">District</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filtered.map((p, i) => (
                      <motion.tr
                        key={p._id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/20"
                      >
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diseaseBadgeColor(getDisease(p))}`}>
                            {formatDisease(getDisease(p)) || "Unknown"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {getConfidence(p) != null ? `${Number(getConfidence(p)).toFixed(1)}%` : "—"}
                        </td>
                        <td className="py-3 pr-4 font-medium text-primary">
                          {getFarmerName(p).trim() || "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TbMapPin size={13} />
                            {getDistrict(p) || "—"}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <TbCalendar size={13} />
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete All Modal */}
      <AnimatePresence>
        {showDeleteAll && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
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
                <button onClick={() => setShowDeleteAll(false)} disabled={isDeleting} className="flex-1 py-2.5 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleDeleteAll} disabled={isDeleting} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? <><TbLoader2 className="animate-spin" size={16} /> Deleting...</> : <><TbTrash size={16} /> Delete All</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
