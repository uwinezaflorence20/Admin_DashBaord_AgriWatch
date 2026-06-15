"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TbUsers, TbChecklist, TbLoader2, TbBrain,
  TbUser, TbMail, TbInbox, TbCalendar, TbPhone,
} from "react-icons/tb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";

import {
  getTeamMembers,
  getRecentActivities,
  getModelMetrics,
  getAllUsers,
  getAgriContacts,
} from "@/lib/api";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState([
    { label: "Total Inquiries", value: "...", icon: TbChecklist, color: "bg-orange-500" },
    { label: "Total Users",     value: "...", icon: TbUser,      color: "bg-green-500"  },
    { label: "Total Activities",value: "...", icon: TbUsers,     color: "bg-blue-500"   },
    { label: "Team Members",    value: "...", icon: TbUsers,     color: "bg-accent"     },
  ]);

  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);

  const fetchModelAccuracy = async () => {
    try {
      const data = await getModelMetrics();
      setModelAccuracy(data.test_accuracy);
    } catch {
      setModelAccuracy("error");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const raw = localStorage.getItem("token");
      const token = raw && raw !== "undefined" ? raw : "";

      const [activitiesResult, teamResult, contactsResult, usersResult] =
        await Promise.allSettled([
          getRecentActivities(),
          getTeamMembers(),
          getAgriContacts(),
          getAllUsers(token),
        ]);

      const activitiesData =
        activitiesResult.status === "fulfilled"
          ? Array.isArray(activitiesResult.value)
            ? activitiesResult.value
            : activitiesResult.value?.data || []
          : [];

      const team =
        teamResult.status === "fulfilled" ? teamResult.value?.data || [] : [];

      const contacts =
        contactsResult.status === "fulfilled"
          ? contactsResult.value?.data || contactsResult.value?.contacts ||
            (Array.isArray(contactsResult.value) ? contactsResult.value : [])
          : [];

      const usersData =
        usersResult.status === "fulfilled" ? usersResult.value?.data || [] : [];

      setInquiries(contacts);

      setStats([
        { label: "Total Inquiries",  value: contacts.length.toString(),       icon: TbChecklist, color: "bg-orange-500" },
        { label: "Total Users",      value: usersData.length.toString(),       icon: TbUser,      color: "bg-green-500"  },
        { label: "Total Activities", value: activitiesData.length.toString(),  icon: TbUsers,     color: "bg-blue-500"   },
        { label: "Team Members",     value: team.length.toString(),            icon: TbUsers,     color: "bg-accent"     },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchDashboardData();
      fetchModelAccuracy();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const modelAccuracyValue =
    modelAccuracy === null ? "..." : modelAccuracy === "error" ? "N/A" : `${modelAccuracy}%`;

  const allStats = [
    ...stats,
    {
      label: "Model Accuracy",
      value: modelAccuracyValue,
      icon: TbBrain,
      color: "bg-purple-500",
      href: "/admin/model-performance",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Stats — 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {allStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card
              onClick={stat.href ? () => router.push(stat.href) : undefined}
              className={cn(
                "border-none bg-white shadow-sm h-full hover:shadow-md transition-shadow",
                stat.href && "cursor-pointer"
              )}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-4 px-4">
                <div className={cn("p-3 rounded-full text-white shrink-0", stat.color)}>
                  <stat.icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-primary leading-tight">
                    {stat.value}
                  </div>
                  <CardTitle className="text-xs text-muted-foreground font-medium leading-snug mt-0.5">
                    {stat.label}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Farmer Inquiries */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Farmer Inquiries</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest contact messages from the AgriWatch platform
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/contacts")}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            View all
          </button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <TbLoader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
              <TbInbox size={32} className="opacity-30" />
              <p className="text-sm">No inquiries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-semibold pr-4">Name</th>
                    <th className="pb-3 font-semibold pr-4">Email</th>
                    <th className="pb-3 font-semibold pr-4">Phone</th>
                    <th className="pb-3 font-semibold pr-4">Message</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inquiries.slice(0, 5).map((item, i) => (
                    <motion.tr
                      key={item._id || i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => router.push("/admin/contacts")}
                    >
                      <td className="py-3 pr-4 font-medium text-primary whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <TbUser size={14} className="text-muted-foreground shrink-0" />
                          {item.name || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TbMail size={13} />
                          {item.email || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <TbPhone size={13} />
                          {item.phone || item.phoneNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-xs truncate">
                        {item.message || "—"}
                      </td>
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <TbCalendar size={13} />
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
