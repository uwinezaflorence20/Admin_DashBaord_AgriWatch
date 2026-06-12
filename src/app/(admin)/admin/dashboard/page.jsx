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

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState([
    { label: "Pending Inquiries", value: "...", icon: TbChecklist, color: "bg-orange-500" },
    { label: "Total Users", value: "...", icon: TbUser, color: "bg-green-500" },
  ]);

  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);

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
        teamResult.status === "fulfilled"
          ? teamResult.value?.data || []
          : [];

      const contactData =
        contactResult.status === "fulfilled"
          ? contactResult.value?.data || contactResult.value || []
          : [];

      const usersData =
        usersResult.status === "fulfilled"
          ? usersResult.value?.data || []
          : [];

      setStats([
        {
          label: "Pending Inquiries",
          value: contactData.length.toString(),
          icon: TbChecklist,
          color: "bg-orange-500",
        },
        {
          label: "Total Users",
          value: usersData.length.toString(),
          icon: TbUser,
          color: "bg-green-500",
        },
        {
          label: "Total Activities",
          value: activitiesData.length.toString(),
          icon: TbActivity,
          color: "bg-blue-500",
        },
        {
          label: "Team Members",
          value: team.length.toString(),
          icon: TbUsers,
          color: "bg-accent",
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchModelAccuracy();
  }, []);

  const modelAccuracyValue =
    modelAccuracy === null
      ? "..."
      : modelAccuracy === "error"
      ? "N/A"
      : `${modelAccuracy}%`;

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

  function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              onClick={stat.href ? () => router.push(stat.href) : undefined}
              className={cn(
                "border-none bg-white shadow-sm h-full hover:shadow-md transition-shadow",
                stat.href && "cursor-pointer"
              )}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={cn("p-4 rounded-full text-white", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Contact Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <TbLoader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Dashboard loaded successfully
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
