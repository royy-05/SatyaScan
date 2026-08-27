import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { documentsApi } from "./api";
import { adminApi } from "../admin/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  AlertCircle,
  ShieldAlert,
  Users,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (user.role === "ADMIN") {
          const statsRes = await adminApi.getStats();
          setAdminStats(statsRes.data);
        }

        if (user.role === "OFFICER" || user.role === "ADMIN") {
          const queueRes = await documentsApi.list({ status: "PENDING_REVIEW" });
          setQueueCount(queueRes.data?.meta?.total || 0);
        }

        const docsRes = await documentsApi.list({ limit: 5 });
        setRecentDocs(docsRes.data?.items || []);
      } catch (_err) {
        // Fallback demo data
      }
    }
    loadDashboardData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Operational Banner */}
      <div className="bg-[#0F172A] text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-[#0FA891]" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Border Security Operations Console
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Active User: <span className="font-bold text-white">{user.name}</span> • Role:{" "}
            <span className="font-mono text-[#0FA891] font-semibold">{user.role}</span>
          </p>
        </div>

        {user.role === "SUBMITTER" && (
          <Link to="/app/scan">
            <Button className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold px-5 rounded-xl">
              <UploadCloud className="mr-2 h-4 w-4" />
              New Credential Scan
            </Button>
          </Link>
        )}

        {(user.role === "OFFICER" || user.role === "ADMIN") && (
          <Link to="/app/reviews/queue">
            <Button className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold px-5 rounded-xl">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Review Queue ({queueCount})
            </Button>
          </Link>
        )}
      </div>

      {/* Role-Specific Metric Cards */}
      {user.role === "ADMIN" && adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Submissions"
            value={adminStats.totalDocs}
            description="Total documents ingested"
            icon={FileCheck2}
            valueColor="text-[#0F172A]"
          />

          <StatCard
            title="Anomaly Flag Rate"
            value={`${adminStats.flagRate}%`}
            description="Flagged for manual review"
            icon={AlertCircle}
            valueColor="text-amber-600"
          />

          <StatCard
            title="Review Queue"
            value={queueCount}
            description="Pending officer decisions"
            icon={ShieldAlert}
            valueColor="text-rose-600"
          />

          <StatCard
            title="Officer Throughput"
            value={adminStats.officerThroughput}
            description="Avg decisions per active officer"
            icon={Users}
            valueColor="text-emerald-600"
          />
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A] tracking-wide uppercase">
            Recent Verification Activity
          </h3>
          <Link to="/app/submissions" className="text-xs text-[#0FA891] hover:underline font-semibold flex items-center">
            View All Submissions <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs bg-white border border-slate-200">
            No recent documents found. Click "New Credential Scan" to begin.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {recentDocs.map((doc) => {
              const latestVer = doc.verifications?.[0];
              return (
                <div
                  key={doc.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-[#0FA891] transition-all duration-150 shadow-xs"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-[#0FA891]/10 border border-[#0FA891]/20 flex items-center justify-center text-[#0FA891]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{doc.originalFilename}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge variant={latestVer?.verdict || "PROCESSING"}>
                      {latestVer?.verdict || doc.status}
                    </Badge>
                    <Link
                      to={`/app/submissions/${doc.id}`}
                      className="text-xs font-semibold text-[#0FA891] hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, valueColor }) {
  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <Icon className="h-5 w-5 text-[#0FA891]" />
      </div>
      <div>
        <div className={`text-2xl font-extrabold font-mono ${valueColor}`}>{value}</div>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
      </div>
    </Card>
  );
}

export default DashboardPage;
