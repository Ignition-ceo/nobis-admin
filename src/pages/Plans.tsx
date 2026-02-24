import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreditCard, Loader2, Plus, Pencil, Trash2, Shield, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MODULES = [
  { id: "phone", label: "Phone Verification", icon: "📱" },
  { id: "email", label: "Email Verification", icon: "📧" },
  { id: "idDocument", label: "ID Document", icon: "🪪" },
  { id: "selfie", label: "Selfie / Liveness", icon: "🤳" },
  { id: "proofOfAddress", label: "Proof of Address", icon: "🏠" },
];

const RISK_LEVELS = [
  { value: 0, label: "Off" },
  { value: 1, label: "Basic" },
  { value: 2, label: "Full" },
];

const SANCTIONS_LEVELS = [
  { value: 0, label: "Off" },
  { value: 1, label: "Basic" },
  { value: 2, label: "Full" },
];

const emptyForm = {
  name: "",
  description: "",
  intakeModules: [] as string[],
  defaults: { riskLevel: 0, sanctionsLevel: 0 },
  pricePerVerification: 0,
};

export default function Plans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/super-admin/plans");
      setPlans(res.data.plans || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      description: plan.description || "",
      intakeModules: plan.intakeModules || [],
      defaults: { riskLevel: plan.defaults?.riskLevel ?? 0, sanctionsLevel: plan.defaults?.sanctionsLevel ?? 0 },
      pricePerVerification: plan.pricePerVerification || 0,
    });
    setModalOpen(true);
  };

  const toggleModule = (mod: string) => {
    setForm(prev => ({
      ...prev,
      intakeModules: prev.intakeModules.includes(mod)
        ? prev.intakeModules.filter(m => m !== mod)
        : [...prev.intakeModules, mod],
    }));
  };

  const savePlan = async () => {
    if (!form.name || form.intakeModules.length === 0) {
      toast({ title: "Validation Error", description: "Plan name and at least one module are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingPlan) {
        await api.patch(`/super-admin/plans/${editingPlan._id}`, form);
        toast({ title: "Plan Updated", description: `${form.name} has been updated.` });
      } else {
        await api.post("/super-admin/plans", form);
        toast({ title: "Plan Created", description: `${form.name} has been created.` });
      }
      setModalOpen(false);
      await fetchPlans();
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || "Failed to save plan.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const deletePlan = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/super-admin/plans/${deleteId}`);
      toast({ title: "Plan Deleted" });
      await fetchPlans();
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || "Failed to delete plan.", variant: "destructive" });
    } finally { setDeleteId(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plans & Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Manage subscription plans and pricing</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Create Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plan)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteId(plan._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardDescription>{plan.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.pricePerVerification > 0 && (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">${plan.pricePerVerification.toFixed(2)}</span>
                  <span className="text-sm text-slate-400">/ verification</span>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Verification Modules</p>
                <div className="flex flex-wrap gap-1">
                  {(plan.intakeModules || []).map((m: string) => (
                    <Badge key={m} variant="secondary" className="text-[10px]">{MODULES.find(mod => mod.id === m)?.label || m}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Risk: <span className="font-medium">{RISK_LEVELS[plan.defaults?.riskLevel || 0]?.label}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Sanctions: <span className="font-medium">{SANCTIONS_LEVELS[plan.defaults?.sanctionsLevel || 0]?.label}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Enterprise KYC" />
              </div>
              <div className="space-y-2">
                <Label>Price per Verification ($)</Label>
                <Input type="number" step="0.01" min="0" value={form.pricePerVerification} onChange={(e) => setForm({ ...form, pricePerVerification: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Plan description" />
            </div>
            <div className="space-y-2">
              <Label>Verification Modules</Label>
              <div className="grid grid-cols-1 gap-2">
                {MODULES.map((mod) => (
                  <label key={mod.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.intakeModules.includes(mod.id) ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <Checkbox checked={form.intakeModules.includes(mod.id)} onCheckedChange={() => toggleModule(mod.id)} />
                    <span className="text-base">{mod.icon}</span>
                    <span className="text-sm font-medium">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk / Fraud Level</Label>
                <Select value={form.defaults.riskLevel.toString()} onValueChange={(v) => setForm({ ...form, defaults: { ...form.defaults, riskLevel: parseInt(v) } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map((l) => <SelectItem key={l.value} value={l.value.toString()}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sanctions Level</Label>
                <Select value={form.defaults.sanctionsLevel.toString()} onValueChange={(v) => setForm({ ...form, defaults: { ...form.defaults, sanctionsLevel: parseInt(v) } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SANCTIONS_LEVELS.map((l) => <SelectItem key={l.value} value={l.value.toString()}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={savePlan} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the plan. Clients using this plan will need to be reassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlan} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
