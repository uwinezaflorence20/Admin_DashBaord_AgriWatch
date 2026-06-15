"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLoader2, TbSearch, TbMail, TbPhone, TbUser,
  TbMessageCircle, TbInbox, TbCalendar,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAgriContacts } from "@/lib/api";
import { toast } from "sonner";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await getAgriContacts();
      setContacts(res?.data || res?.contacts || (Array.isArray(res) ? res : []));
    } catch (err) {
      toast.error(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.message || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 rounded-full bg-primary text-white"><TbInbox size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-primary">{loading ? "..." : contacts.length}</div>
              <CardTitle className="text-sm text-muted-foreground">Total Inquiries</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 rounded-full bg-accent text-white"><TbMessageCircle size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-primary">{loading ? "..." : filtered.length}</div>
              <CardTitle className="text-sm text-muted-foreground">Showing</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">Contact Inquiries</CardTitle>
          <div className="relative">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, message..."
              className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/40 w-60"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16"><TbLoader2 className="animate-spin text-primary" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-2">
              <TbInbox size={40} className="opacity-30" />
              <p className="text-sm">No contact inquiries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 pr-4 font-semibold">Name</th>
                    <th className="pb-3 pr-4 font-semibold">Email</th>
                    <th className="pb-3 pr-4 font-semibold">Phone</th>
                    <th className="pb-3 pr-4 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filtered.map((c, i) => (
                      <motion.tr
                        key={c._id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/20 cursor-pointer"
                        onClick={() => setSelected(c)}
                      >
                        <td className="py-3 pr-4 font-medium text-primary whitespace-nowrap">
                          <span className="flex items-center gap-1.5"><TbUser size={14} className="text-muted-foreground" />{c.name || "—"}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><TbMail size={13} />{c.email || "—"}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><TbPhone size={13} />{c.phone || c.phoneNumber || "—"}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-[200px] truncate">
                          {c.message || "—"}
                        </td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <TbCalendar size={13} />
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
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

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Inquiry Details</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-primary transition-colors">
                  <TbSearch size={20} className="rotate-45" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Name", value: selected.name, icon: TbUser },
                  { label: "Email", value: selected.email, icon: TbMail },
                  { label: "Phone", value: selected.phone || selected.phoneNumber, icon: TbPhone },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                      <row.icon size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{row.label}</p>
                      <p className="text-sm font-semibold text-primary">{row.value || "—"}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Message</p>
                  <p className="text-sm text-primary leading-relaxed">{selected.message || "—"}</p>
                </div>
                {selected.createdAt && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Received on {new Date(selected.createdAt).toLocaleString("en-GB")}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
