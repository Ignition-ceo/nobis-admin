import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle, RefreshCw, Loader2, Server, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Health() {
  const [data, setData] = useState<any>(null);
  const [screeningHealth, setScreeningHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const [healthRes, screeningRes] = await Promise.all([
        api.get("/super-admin/health"),
        api.get("/screening/health").catch(() => ({ data: null })),
      ]);
      setData(healthRes.data);
      setScreeningHealth(screeningRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  const StatusBadge = ({ ok }: { ok: boolean }) => (
    <Badge className={ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
      {ok ? <><CheckCircle2 className="h-3 w-3 mr-1" />Healthy</> : <><XCircle className="h-3 w-3 mr-1" />Down</>}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor platform services and metrics</p>
        </div>
        <Button variant="outline" onClick={fetchHealth} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-slate-500" />
              <span className="font-medium text-sm">API Server</span>
            </div>
            <StatusBadge ok={data?.services?.api === "running"} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-slate-500" />
              <span className="font-medium text-sm">Database</span>
            </div>
            <StatusBadge ok={data?.services?.database === "connected"} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-500" />
              <span className="font-medium text-sm">OpenSanctions</span>
            </div>
            <StatusBadge ok={screeningHealth?.open_sanctions === true} />
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <Card>
        <CardHeader><CardTitle className="text-base">24-Hour Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Applicants", value: data?.metrics?.applicants24h || 0 },
              { label: "Verifications", value: data?.metrics?.verifications24h || 0 },
              { label: "Failed", value: data?.metrics?.failedVerifications24h || 0 },
              { label: "Success Rate", value: `${data?.metrics?.successRate || 100}%` },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{m.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{m.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
