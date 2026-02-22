import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Clock, Users } from "lucide-react";

export default function SASettings() {
  const [settings, setSettings] = useState({
    defaultScreeningProvider: "open_sanctions",
    defaultScreeningThreshold: "0.7",
    maxApplicantsPerClient: 100,
    auditRetentionDays: 90,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/super-admin/settings")
      .then((res) => setSettings((prev) => ({ ...prev, ...res.data })))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/super-admin/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Global configuration for the NOBIS platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base">Screening Defaults</CardTitle>
              <CardDescription>Default AML/sanctions screening settings for new clients</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default Provider</Label>
              <Select value={settings.defaultScreeningProvider} onValueChange={(v) => setSettings({ ...settings, defaultScreeningProvider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_sanctions">OpenSanctions</SelectItem>
                  <SelectItem value="aml_watcher">AML Watcher</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">Clients without a custom provider will use this</p>
            </div>
            <div className="space-y-2">
              <Label>Default Match Threshold</Label>
              <Select value={settings.defaultScreeningThreshold} onValueChange={(v) => setSettings({ ...settings, defaultScreeningThreshold: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.50 — Broad</SelectItem>
                  <SelectItem value="0.6">0.60 — Moderate</SelectItem>
                  <SelectItem value="0.7">0.70 — Balanced (recommended)</SelectItem>
                  <SelectItem value="0.8">0.80 — Strict</SelectItem>
                  <SelectItem value="0.9">0.90 — Very strict</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">Results below this score are excluded</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Client Limits</CardTitle>
              <CardDescription>Default resource limits for new client accounts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Max Applicants Per Client</Label>
              <Input type="number" value={settings.maxApplicantsPerClient} onChange={(e) => setSettings({ ...settings, maxApplicantsPerClient: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-slate-400">Set to 0 for unlimited</p>
            </div>
            <div className="space-y-2">
              <Label>API Rate Limit (req/hour)</Label>
              <Input type="number" defaultValue={1000} disabled />
              <p className="text-xs text-slate-400">Configured per client</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Data & Retention</CardTitle>
              <CardDescription>Data retention policies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Audit Log Retention (days)</Label>
              <Input type="number" value={settings.auditRetentionDays} onChange={(e) => setSettings({ ...settings, auditRetentionDays: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-slate-400">Events older than this are archived</p>
            </div>
            <div className="space-y-2">
              <Label>Verification Data Retention (days)</Label>
              <Input type="number" defaultValue={365} disabled />
              <p className="text-xs text-slate-400">Applicant data retention period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600 font-medium">Settings saved</span>}
        <Button onClick={save} disabled={saving} className="min-w-[160px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
