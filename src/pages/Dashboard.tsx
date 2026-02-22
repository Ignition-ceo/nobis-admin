import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, FileCheck, Activity, Loader2, TrendingUp, Building2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  const stats = [
    { label: "Total Clients", value: data?.clients?.total || 0, sub: `${data?.clients?.active || 0} active`, icon: Building2, color: "bg-blue-50 text-blue-600" },
    { label: "Total Applicants", value: data?.applicants?.total || 0, sub: `${data?.applicants?.today || 0} today`, icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { label: "Verifications", value: data?.verifications?.total || 0, sub: `${data?.verifications?.today || 0} today`, icon: FileCheck, color: "bg-purple-50 text-purple-600" },
    { label: "This Month", value: data?.applicants?.month || 0, sub: `${data?.applicants?.week || 0} this week`, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of the NOBIS platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{s.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Clients by Usage</CardTitle></CardHeader>
          <CardContent>
            {data?.topClients?.length ? (
              <div className="space-y-3">
                {data.topClients.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.companyName || c.email || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <Badge variant="secondary">{c.applicantCount} applicants</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No data yet</p>}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {data?.recentActivity?.length ? (
              <div className="space-y-3">
                {data.recentActivity.map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <Activity className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{e.action}</p>
                      <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No recent activity</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
