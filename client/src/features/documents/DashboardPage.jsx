import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { documentsApi } from "./api";
import { reviewsApi } from "../reviews/api";
import { adminApi } from "../admin/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import {
  UploadCloud,
  FileCheck2,
  ShieldAlert,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentDocs, setRecentDocs] = useState([]);
  const [queueCount, setQueueCount] = useState(0);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (user.role === "SUBMITTER") {
          const res = await documentsApi.list({ pageSize: 5 });
          setRecentDocs(res.data || []);
        } else if (user.role === "OFFICER") {
          const [queueRes, docsRes] = await Promise.all([
            reviewsApi.getQueue({ pageSize: 1 }),
            documentsApi.list({ pageSize: 5 }),
          ]);
          setQueueCount(queueRes.meta?.total || 0);
          setRecentDocs(docsRes.data || []);
        } else if (user.role === "ADMIN") {
          const [statsRes, queueRes] = await Promise.all([
            adminApi.getStats(),
            reviewsApi.getQueue({ pageSize: 1 }),
          ]);
          setAdminStats(statsRes.data);
          setQueueCount(queueRes.meta?.total || 0);
        }
      } catch (_err) {
        // Handled in interceptor toast
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Operational Banner */}
      <div className="bg-[#283733] text-[#FDF6F0] p-6 rounded-md border border-[#475853] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-[#DBCEB1]" />
            <h1 className="text-xl font-bold tracking-tight">
              Border Security Operations Console
            </h1>
          </div>
          <p className="text-xs text-[#DBCEB1]/80">
            Active User: <span className="font-bold text-[#FDF6F0]">{user.name}</span> • Role:{" "}
            <span className="font-mono text-[#DBCEB1] font-semibold">{user.role}</span> • Station SSB Checkpoint #04
          </p>
        </div>

        {user.role === "SUBMITTER" && (
          <Link to="/app/submit">
            <Button variant="gold" className="px-5">
              <UploadCloud className="mr-2 h-4 w-4" />
              New Credential Scan
            </Button>
          </Link>
        )}

        {(user.role === "OFFICER" || user.role === "ADMIN") && (
          <Link to="/app/reviews/queue">
            <Button variant="gold" className="px-5">
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
            description="Total documents ingested into system"
            icon={FileCheck2}
            valueColor="text-[#283733]"
          />

          <StatCard
            title="Anomaly Flag Rate"
            value={`${adminStats.flagRate}%`}
            description="Flagged for manual review"
            icon={AlertCircle}
            valueColor="text-[#C58A32]"
          />

          <StatCard
            title="Review Queue"
            value={queueCount}
            description="Pending officer review decisions"
            icon={ShieldAlert}
            valueColor="text-[#B84A4A]"
          />

          <StatCard
            title="Officer Throughput"
            value={adminStats.officerThroughput}
            description="Avg decisions per active officer"
            icon={Users}
            valueColor="text-[#2F7D5A]"
          />
        </div>
      )}

      {/* Recent Submissions Activity Feed */}
      {(user.role === "SUBMITTER" || user.role === "OFFICER") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#283733] tracking-wide uppercase">
              Recent Verification Activity
            </h3>
            <Link to="/app/submissions" className="text-xs text-[#475853] hover:underline font-semibold flex items-center">
              View All Submissions <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <Card className="p-8 text-center text-[#71807A] text-xs">
              No recent documents found. Click "New Credential Scan" to upload a document.
            </Card>
          ) : (
            <div className="space-y-2.5">
              {recentDocs.map((doc) => {
                const latestVer = doc.verifications?.[0];
                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-white border border-[#71807A]/25 rounded-md flex items-center justify-between hover:border-[#475853] transition-colors shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-9 w-9 rounded bg-[#FCF5EE] border border-[#71807A]/20 flex items-center justify-center text-[#475853]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#283733]">{doc.originalFilename}</p>
                        <p className="text-[11px] font-mono text-[#71807A]">
                          {doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {latestVer ? (
                        <Badge variant={latestVer.verdict}>
                          {latestVer.verdict} ({(latestVer.overallScore * 100).toFixed(0)}%)
                        </Badge>
                      ) : (
                        <Badge variant={doc.status}>{doc.status}</Badge>
                      )}
                      <Link to={`/app/submissions/${doc.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

