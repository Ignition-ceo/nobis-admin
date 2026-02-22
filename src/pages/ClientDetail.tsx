import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Building2, Users, FileCheck, Shield, Settings, Mail, Phone, Key, ToggleRight, ToggleLeft, Save } from "lucide-react";

const FEATURES = [
  { key: "idVerification", label: "ID Verification", desc: "Document scanning and OCR" },
  { key: "livenessCheck", label: "Liveness Check", desc: "Facial liveness detection" },
  { key: "proofOfAddress", label: "Proof of Address", desc: "Address document verification" },
  { key: "fraudChecks", label: "Fraud Checks", desc: "Risk scoring and fraud detection" },
  { key: "amlScreening", label: "AML Screening", desc: "Anti-money laundering checks" },
  { key: "sanctionsScreening", label: "Sanctions Screening", desc: "Global sanctions screening" },
  { key: "biometricMatching", label: "Biometric Matching", desc: "Face match ID vs selfie" },
  { key: "webhooks", label: "Webhooks", desc: "Real-time notifications" },
  { key: "apiAccess", label: "API Access", desc: "REST API and SDK access" },
  { key: "batchProcessing", label: "Batch Processing", desc: "Bulk applicant processing" },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", companyName: "", phone: "", isActive: true, maxApplicants: 100, rateLimit: 1000 });
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cr, pr] = await Promise.all([api.get(`/super-admin/clients/${id}`), api.get("/super-admin/plans")]);
        const c = cr.data;
        setClient(c);
        setAllPlans(pr.data.plans || []);
        setForm({ firstName: c.firstName || "", lastName: c.lastName || "", email: c.email || "", companyName: c.companyName || "", phone: c.phone || "", isActive: c.isActive ?? true, maxApplicants: c.maxApplicants || 100, rateLimit: c.rateLimit || 1000 });
        setSelectedPlans((c.subscriptionPlans || []).map((p: any) => p._id?.toString() || p.toString()));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const saveClient = async () => {
    setSaving(true); setSaved(false);
    try {
      await api.patch(`/super-admin/clients/${id}`, form);
      await api.patch(`/super-admin/clients/${id}/plans`, { planIds: selectedPlans });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const togglePlan = (pid: string) => setSelectedPlans((p) => p.includes(pid) ? p.filter((x) => x !== pid) : [...p, pid]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!client) return <div className="text-center py-12 text-slate-500">Client not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.firstName} {client.lastName}</h1>
            <p className="text-sm text-slate-500">{client.companyName || client.email}</p>
          </div>
          <Badge className={client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>{client.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved</span>}
          <Button onClick={saveClient} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Changes</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Applicants", value: client.stats?.applicantCount || 0, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Verifications", value: client.stats?.verificationCount || 0, icon: FileCheck, color: "bg-emerald-50 text-emerald-600" },
          { label: "Active Modules", value: client.activeModules?.length || 0, icon: Settings, color: "bg-purple-50 text-purple-600" },
          { label: "Plans", value: client.plans?.length || 0, icon: Shield, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p></div><div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon className="h-5 w-5" /></div></div></CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="plans">Plans & Features</TabsTrigger>
          <TabsTrigger value="applicants">Recent Applicants</TabsTrigger>
          <TabsTrigger value="access">Access & Security</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Client Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
                <div className="space-y-2"><Label>Phone</Label><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></div>
                <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Status</Label><Button variant="outline" className="w-full justify-start" onClick={() => setForm({ ...form, isActive: !form.isActive })}>{form.isActive ? <ToggleRight className="h-4 w-4 mr-2 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 mr-2 text-slate-400" />}{form.isActive ? "Active" : "Inactive"}</Button></div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Max Applicants</Label><Input type="number" value={form.maxApplicants} onChange={(e) => setForm({ ...form, maxApplicants: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Rate Limit (req/hour)</Label><Input type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="plans" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Subscription Plans</CardTitle><CardDescription>Select which plans this client has access to</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allPlans.map((plan) => { const sel = selectedPlans.includes(plan._id); return (
                  <div key={plan._id} onClick={() => togglePlan(plan._id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${sel ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-sm">{plan.name}</h3><Checkbox checked={sel} /></div>
                    <p className="text-xs text-slate-500 mb-2">{plan.description || "\u2014"}</p>
                    <div className="flex flex-wrap gap-1">{(plan.intakeModules || []).map((m: string) => (<Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>))}</div>
                    {plan.pricePerVerification > 0 && <p className="text-xs text-slate-500 mt-2">${plan.pricePerVerification}/verification</p>}
                  </div>); })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Active Features</CardTitle><CardDescription>Features available based on assigned plans</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FEATURES.map((f) => { const on = client.activeFeatures?.[f.key] || false; return (
                  <div key={f.key} className={`flex items-center gap-3 p-3 rounded-lg border ${on ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                    <div className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div><p className="text-sm font-medium text-slate-700">{f.label}</p><p className="text-xs text-slate-400">{f.desc}</p></div>
                  </div>); })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Verification Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(client.stats?.verificationsBreakdown || {}).map(([t, c]) => (
                  <div key={t} className="text-center p-3 rounded-lg bg-slate-50"><p className="text-lg font-bold text-slate-900">{c as number}</p><p className="text-xs text-slate-500">{t}</p></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="applicants" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Applicants</CardTitle></CardHeader>
            <CardContent>
              {client.recentApplicants?.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                  <TableBody>{client.recentApplicants.map((a: any) => (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium text-sm">{a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "\u2014"}</TableCell>
                      <TableCell className="text-sm text-slate-500">{a.email || "\u2014"}</TableCell>
                      <TableCell><Badge variant="secondary">{a.verificationStatus || "pending"}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>))}</TableBody>
                </Table>
              ) : <p className="text-sm text-slate-400 py-4">No applicants yet</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="access" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" />API Credentials</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2"><Label>OAuth Client ID</Label><Input value={client.oauthClientId || "Not configured"} disabled className="font-mono text-xs" /></div>
              <div className="space-y-2"><Label>Auth0 Organization ID</Label><Input value={client.auth0OrgId || "Not configured"} disabled className="font-mono text-xs" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Scopes</CardTitle><CardDescription>API permissions granted</CardDescription></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">{(client.scopes || []).map((s: string) => (<Badge key={s} variant="outline" className="font-mono text-xs">{s}</Badge>))}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Organization Members</CardTitle></CardHeader>
            <CardContent>
              {client.orgMembers?.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Added</TableHead></TableRow></TableHeader>
                  <TableBody>{client.orgMembers.map((m: any, i: number) => (
                    <TableRow key={i}><TableCell className="text-sm">{m.email}</TableCell><TableCell><Badge variant="secondary">{m.role}</Badge></TableCell><TableCell className="text-sm text-slate-400">{m.addedAt ? new Date(m.addedAt).toLocaleDateString() : "\u2014"}</TableCell></TableRow>
                  ))}</TableBody>
                </Table>
              ) : <p className="text-sm text-slate-400 py-4">No org members configured</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Screening Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-500 uppercase">Provider</p><p className="text-sm font-medium mt-1">{client.screeningConfig?.provider || "default"}</p></div>
                <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-500 uppercase">Threshold</p><p className="text-sm font-medium mt-1">{client.screeningConfig?.threshold || 0.7}</p></div>
                <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-500 uppercase">Dataset</p><p className="text-sm font-medium mt-1">{client.screeningConfig?.dataset || "default"}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
