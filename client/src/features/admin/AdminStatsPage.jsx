import React, { useEffect, useState } from "react";
import { adminApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { TrendingUp, Users, AlertCircle, FileCheck2, ShieldAlert } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch (_err) {
        // Handled in interceptor
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Operations & Forensic Analytics"
        description="Telemetry analytics monitoring ingestion volume, anomaly flag rates, and officer decision throughput."
        badge={<Badge variant="PASS">Live Intelligence</Badge>}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents Ingested"
          value={stats.totalDocs}
          description="Total credentials scanned"
          icon={FileCheck2}
          valueColor="text-[#283733]"
        />

        <StatCard
          title="Anomaly Flag Rate"
          value={`${stats.flagRate}%`}
          description="Flagged for manual review"
          icon={AlertCircle}
          valueColor="text-[#C58A32]"
        />

        <StatCard
          title="Review Queue Length"
          value={stats.queueCount}
          description="Cases pending officer decision"
          icon={ShieldAlert}
          valueColor="text-[#B84A4A]"
        />

        <StatCard
          title="Officer Throughput"
          value={stats.officerThroughput}
          description="Average reviews per active officer"
          icon={Users}
          valueColor="text-[#2F7D5A]"
        />
      </div>

      {/* Daily Submission Volume Chart */}
      <Card className="p-6 space-y-4 border border-[#71807A]/25 bg-white">
        <div className="flex items-center justify-between border-b border-[#71807A]/20 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#283733]">
              Daily Ingestion Volume (7-Day Trend)
            </h3>
            <p className="text-xs text-[#71807A]">Volume of documents scanned per calendar day</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            7-Day Window
          </Badge>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailySubmissions || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#71807A" strokeOpacity={0.2} />
              <XAxis
                dataKey="date"
                stroke="#71807A"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#71807A"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#283733",
                  borderColor: "#475853",
                  color: "#FDF6F0",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              />
              <Bar
                dataKey="count"
                fill="#475853"
                radius={[4, 4, 0, 0]}
                name="Documents Uploaded"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
