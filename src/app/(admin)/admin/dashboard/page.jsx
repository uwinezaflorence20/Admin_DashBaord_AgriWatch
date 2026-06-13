"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TbActivity,
  TbUsers,
  TbChecklist,
  TbLoader2,
  TbBrain,
  TbUser,
  TbMail,
  TbMapPin,
  TbShieldCheck,
  TbShieldOff,
} from "react-icons/tb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";

import {
  getTeamMembers,
  getContacts,
  getRecentActivities,
  getModelMetrics,
  getAllUsers,
} from "@/lib/api";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState([
    { label: "Pending Inquiries", value: "...", icon: TbChecklist, color: "bg-orange-500" },
    { label: "Total Users",       value: "...", icon: TbUser,      color: "bg-green-500"  },
    { label: "Total Activities",  value: "...", icon: TbActivity,  color: "bg-blue-500"   },
    { label: "Team Members",      value: "...", icon: TbUsers,     color: "bg-accent"      },
  ]);

  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

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
      const token = localStorage.getItem("token");

      const [activitiesResult, teamResult, contactResult, usersResult] =
        await Promise.allSettled([
          getRecentActivities(),
          getTeamMembers(),
          getContacts(),
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

      const contactData =
        contactResult.status === "fulfilled"
          ? contactResult.value?.data || contactResult.value || []
          : [];

      const usersData =
        usersResult.status === "fulfilled" ? usersResult.value?.data || [] : [];

      setUsers(usersData);

      setStats([
        { label: "Pending Inquiries", value: contactData.length.toString(),   icon: TbChecklist, color: "bg-orange-500" },
        { label: "Total Users",       value: usersData.length.toString(),      icon: TbUser,      color: "bg-green-500"  },
        { label: "Total Activities",  value: activitiesData.length.toString(), icon: TbActivity,  color: "bg-blue-500"   },
        { label: "Team Members",      value: team.length.toString(),           icon: TbUsers,     color: "bg-accent"      },
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

      {/* Stats — 5 cards, 2 cols on mobile → 3 on md → 5 on xl */}
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

      {/* Users overview */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Registered Users</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest accounts from the AgriWatch platform
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/users")}
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
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
              <TbUsers size={32} className="opacity-30" />
              <p className="text-sm">No users yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-semibold pr-4">Name</th>
                    <th className="pb-3 font-semibold pr-4">Email</th>
                    <th className="pb-3 font-semibold pr-4">Role</th>
                    <th className="pb-3 font-semibold pr-4">Location</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.slice(0, 5).map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-primary whitespace-nowrap">
                        {user.FirstName} {user.LastName}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TbMail size={13} />
                          {user.Email}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            user.Role === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          )}
                        >
                          {user.Role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                        {user.location?.district ? (
                          <span className="flex items-center gap-1">
                            <TbMapPin size={13} />
                            {user.location.district}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3">
                        {user.verified ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                            <TbShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-orange-500">
                            <TbShieldOff size={14} /> Unverified
                          </span>
                        )}
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
