import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { documentsApi } from "./api";
import { reviewsApi } from "../reviews/api";
import { adminApi } from "../admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome, <span className="text-cyan-400">{user.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="font-semibold text-slate-300">{user.role}</span> on SSB Border Control Station.
          </p>
        </div>

        {user.role === "SUBMITTER" && (
          <Link to="/app/submit">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
              <UploadCloud className="mr-2 h-4 w-4" />
              New Document Submission
            </Button>
          </Link>
        )}

        {(user.role === "OFFICER" || user.role === "ADMIN") && (
          <Link to="/app/reviews/queue">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Review Queue ({queueCount})
            </Button>
          </Link>
        )}
      </div>

      {/* Role-Specific Metric Cards */}
      {user.role === "ADMIN" && adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Submissions</CardTitle>
              <FileCheck2 className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{adminStats.totalDocs}</div>
              <p className="text-xs text-slate-500 mt-1">Total documents ingested</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Flag Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{adminStats.flagRate}%</div>
              <p className="text-xs text-slate-500 mt-1">Anomalies or low-confidence flags</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Review Queue</CardTitle>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{queueCount}</div>
              <p className="text-xs text-slate-500 mt-1">Pending officer decisions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Officer Throughput</CardTitle>
              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{adminStats.officerThroughput}</div>
              <p className="text-xs text-slate-500 mt-1">Avg reviews per active officer</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submitter & Officer Quick View */}
      {(user.role === "SUBMITTER" || user.role === "OFFICER") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Recent Submissions</h3>
            <Link to="/app/submissions" className="text-xs text-cyan-400 hover:underline flex items-center">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <Card className="border-slate-800 p-8 text-center text-slate-400">
              No recent documents found. Click "New Document Submission" to upload.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recentDocs.map((doc) => {
                const latestVer = doc.verifications?.[0];
                return (
                  <div
                    key={doc.id}
                    className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{doc.originalFilename}</p>
                        <p className="text-xs text-slate-400">{doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}</p>
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
                        <Button size="sm" variant="ghost">Details</Button>
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
