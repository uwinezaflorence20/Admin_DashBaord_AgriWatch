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
      setTopDistricts(d?.data || d?.districts || (Array.isArray(d) ? d : []));
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

  const filteredPreds = predictions.filter((p) => {
    const q = search.toLowerCase();
    const disease = formatDisease(p.disease || p.result || p.prediction || "").toLowerCase();
    const district = (p.district || p.userId?.location?.district || "").toLowerCase();
    const farmer = `${p.userId?.FirstName || p.userId?.firstName || ""} ${p.userId?.LastName || p.userId?.lastName || ""}`.toLowerCase();
    return disease.includes(q) || district.includes(q) || farmer.includes(q);
  });

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Late Blight Cases", value: loading ? "..." : totalCases, icon: TbLeaf, color: "bg-red-500" },
          { label: "Districts Affected",       value: loading ? "..." : districtStats.length, icon: TbMapPin, color: "bg-primary" },
          { label: "Total Scan Records",       value: loading ? "..." : predictions.length, icon: TbChartBar, color: "bg-blue-500" },
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
                  className="p-4 rounded-xl border border-border hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-primary">{d.district}</span>
                      <span className="text-xs text-muted-foreground ml-2">({d.province})</span>
                    </div>
                    <span className="text-sm font-bold text-red-500">{d.totalCases} case{d.totalCases !== 1 ? "s" : ""}</span>
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
                  placeholder="Search disease, district, farmer..."
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
                    <th className="pb-3 pr-4 font-semibold">Disease</th>
                    <th className="pb-3 pr-4 font-semibold">Confidence</th>
                    <th className="pb-3 pr-4 font-semibold">Farmer</th>
                    <th className="pb-3 pr-4 font-semibold">District</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filteredPreds.map((p, i) => {
                      const disease = p.disease || p.result || p.prediction || p.label || "";
                      const confidence = p.confidence || p.Confidence || p.probability || p.score;
                      const farmer = `${p.userId?.FirstName || p.userId?.firstName || ""}  ${p.userId?.LastName || p.userId?.lastName || ""}`.trim();
                      const district = p.district || p.District || p.userId?.location?.district || "";
                      return (
                        <motion.tr
                          key={p._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-muted/20"
                        >
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diseaseBadgeColor(disease)}`}>
                              {formatDisease(disease) || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {confidence != null ? `${Number(confidence).toFixed(1)}%` : "—"}
                          </td>
                          <td className="py-3 pr-4 font-medium text-primary">{farmer || "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <span className="flex items-center gap-1"><TbMapPin size={13} />{district || "—"}</span>
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
