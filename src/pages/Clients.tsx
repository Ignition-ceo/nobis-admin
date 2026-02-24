import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight, CheckCircle, Building2, Shield, User, Mail, Lock, Phone, Users as UsersIcon, Download, Globe, AlertTriangle, XCircle } from "lucide-react";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", companyName: "" });
  const [editSaving, setEditSaving] = useState(false);

  // Onboard modal
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    companyName: "", firstName: "", lastName: "", email: "", password: "", phone: "", maxApplicants: "1000", portalDomain: "platform.getnobis.com",
  });
  const [onboarding, setOnboarding] = useState(false);
  const [onboardResult, setOnboardResult] = useState<any>(null);
  const [onboardError, setOnboardError] = useState("");

  // Delete modal (2-step)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deletePreview, setDeletePreview] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<any>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "25");
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await api.get(`/super-admin/clients?${params}`);
      setClients(res.data.clients || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ─── Edit Client ───────────────────────────────────
  const openEdit = (c: any) => {
    setEditing(c);
    setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, companyName: c.companyName || "" });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditSaving(true);
    try {
      await api.patch(`/super-admin/clients/${editing._id}`, editForm);
      setEditOpen(false);
      fetchClients();
    } catch (e: any) { alert(e?.response?.data?.message || "Error"); }
    finally { setEditSaving(false); }
  };

  // ─── Onboard Client ───────────────────────────────
  const openOnboard = () => {
    setOnboardForm({ companyName: "", firstName: "", lastName: "", email: "", password: "", phone: "", maxApplicants: "1000", portalDomain: "platform.getnobis.com" });
    setOnboardResult(null);
    setOnboardError("");
    setOnboardOpen(true);
  };

  const runOnboard = async () => {
    setOnboarding(true);
    setOnboardError("");
    try {
      const res = await api.post("/admin/onboard-client", {
        companyName: onboardForm.companyName,
        firstName: onboardForm.firstName,
        lastName: onboardForm.lastName,
        email: onboardForm.email,
        password: onboardForm.password,
        phone: onboardForm.phone || undefined,
        maxApplicants: parseInt(onboardForm.maxApplicants) || 1000,
      });
      res.data._portalDomain = onboardForm.portalDomain;
      setOnboardResult(res.data);
      fetchClients();
    } catch (e: any) {
      setOnboardError(e?.response?.data?.message || e?.message || "Onboarding failed");
    }
    finally { setOnboarding(false); }
  };

  // ─── CSV Download ──────────────────────────────────
  const downloadCSV = () => {
    if (!onboardResult) return;
    const r = onboardResult;
    const domain = r._portalDomain || "platform.getnobis.com";
    const rows = [
      ["Field", "Value"],
      ["Company", r.client.companyName],
      ["Admin Name", `${onboardForm.firstName} ${onboardForm.lastName}`],
      ["Admin Email", r.client.email],
      ["Temporary Password", onboardForm.password],
      ["Client ID", r.client.id],
      ["API Key (oauthClientId)", r.client.oauthClientId],
      ["Auth0 Org ID", r.auth0.orgId],
      ["Auth0 Org Name (login slug)", r.auth0.orgName],
      ["Auth0 User ID", r.auth0.userId],
      ["Auth0 User Status", r.auth0.userStatus],
      ["Portal URL", `https://${domain}`],
      ["Login Step 1", `Go to https://${domain}`],
      ["Login Step 2", `Enter organization name: ${r.auth0.orgName}`],
      ["Login Step 3", `Sign in with: ${r.client.email}`],
      ["Onboarded At", new Date().toISOString()],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.client.companyName.toLowerCase().replace(/\s+/g, "-")}-onboarding-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Delete Client (2-step) ────────────────────────
  const openDelete = async (e: React.MouseEvent, client: any) => {
    e.stopPropagation();
    setDeleteTarget(client);
    setDeleteStep(1);
    setDeletePreview(null);
    setDeleteConfirmText("");
    setDeleteResult(null);
    setDeleteOpen(true);
    setDeleteLoading(true);
    try {
      const res = await api.get(`/super-admin/clients/${client._id}/preview-delete`);
      setDeletePreview(res.data);
    } catch (e: any) {
      setDeletePreview({ error: e?.response?.data?.message || "Failed to load preview" });
    }
    finally { setDeleteLoading(false); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/super-admin/clients/${deleteTarget._id}`);
      setDeleteResult(res.data);
      fetchClients();
    } catch (e: any) {
      setDeleteResult({ success: false, message: e?.response?.data?.message || "Delete failed" });
    }
    finally { setDeleting(false); }
  };

  const toggleStatus = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation();
    await api.patch(`/super-admin/clients/${id}/status`, { isActive: !current });
    fetchClients();
  };

  const isOnboardFormValid = onboardForm.companyName && onboardForm.firstName && onboardForm.lastName && onboardForm.email && onboardForm.password && onboardForm.password.length >= 8;

  const expectedConfirmText = deleteTarget?.companyName || deleteTarget?.email || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
          <p className="text-sm text-slate-500 mt-1">{total} clients registered</p>
        </div>
        <Button onClick={openOnboard} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />Onboard Client
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search clients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Auth0 Org</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c._id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/clients/${c._id}`)}>
                    <TableCell>
                      <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{c.companyName || "—"}</TableCell>
                    <TableCell>
                      {c.auth0OrgId ? (
                        <Badge variant="outline" className="text-xs font-mono">{c.auth0OrgId.slice(0, 15)}…</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="secondary">{c.applicantCount || 0}</Badge></TableCell>
                    <TableCell>
                      <Badge className={c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={(e) => toggleStatus(e, c._id, c.isActive)}>
                          {c.isActive ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => openDelete(e, c)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">No clients found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {total > 25 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 25)}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Edit Client Modal ─────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
              <div><Label>Last Name</Label><Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>Company Name</Label><Input value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={editSaving}>{editSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Onboard Client Modal ──────────────────────── */}
      <Dialog open={onboardOpen} onOpenChange={(open) => { if (!onboarding) setOnboardOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {onboardResult ? "Client Onboarded" : "Onboard New Client"}
            </DialogTitle>
            <DialogDescription>
              {onboardResult
                ? "Everything is set up and ready to go."
                : "Create a new client with Auth0 organization, user account, and database record — all in one step."
              }
            </DialogDescription>
          </DialogHeader>

          {onboardResult ? (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <p className="font-medium text-emerald-800">{onboardResult.message}</p>
              </div>
              <div className="grid gap-3">
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-400">Company:</span> <span className="font-medium">{onboardResult.client.companyName}</span></div>
                    <div><span className="text-slate-400">Email:</span> <span className="font-medium">{onboardResult.client.email}</span></div>
                    <div><span className="text-slate-400">Client ID:</span> <span className="font-mono text-xs">{onboardResult.client.id}</span></div>
                    <div><span className="text-slate-400">API Key:</span> <span className="font-mono text-xs">{onboardResult.client.oauthClientId}</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-blue-500 uppercase tracking-wide flex items-center gap-1"><Shield className="h-3 w-3" /> Auth0</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-400">Org ID:</span> <span className="font-mono text-xs">{onboardResult.auth0.orgId}</span></div>
                    <div><span className="text-slate-400">Org Name:</span> <span className="font-medium">{onboardResult.auth0.orgName}</span></div>
                    <div><span className="text-slate-400">User Status:</span>
                      <Badge className={onboardResult.auth0.userStatus === "created" ? "bg-emerald-100 text-emerald-700 ml-1" : "bg-amber-100 text-amber-700 ml-1"}>
                        {onboardResult.auth0.userStatus}
                      </Badge>
                    </div>
                    <div><span className="text-slate-400">Portal:</span> <span className="font-medium">{onboardResult._portalDomain}</span></div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <p className="font-medium mb-1">Login Instructions for Client:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <span className="font-mono">{onboardResult._portalDomain}</span></li>
                    <li>Enter organization name: <span className="font-mono font-bold">{onboardResult.auth0.orgName}</span></li>
                    <li>Sign in with: <span className="font-bold">{onboardResult.client.email}</span></li>
                  </ol>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={downloadCSV} className="gap-2"><Download className="h-4 w-4" />Download CSV</Button>
                <Button onClick={() => setOnboardOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {onboardError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{onboardError}</div>
              )}
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />Company Name</Label>
                <Input placeholder="e.g. TSTT, Digicel, Republic Bank" value={onboardForm.companyName} onChange={(e) => setOnboardForm({ ...onboardForm, companyName: e.target.value })} />
                <p className="text-xs text-slate-400">This becomes the Auth0 org name (e.g., "TSTT" → org slug "tstt")</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" />First Name</Label>
                  <Input placeholder="John" value={onboardForm.firstName} onChange={(e) => setOnboardForm({ ...onboardForm, firstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" value={onboardForm.lastName} onChange={(e) => setOnboardForm({ ...onboardForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />Admin Email</Label>
                <Input type="email" placeholder="admin@company.com" value={onboardForm.email} onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })} />
                <p className="text-xs text-slate-400">This person becomes the org admin and can add team members</p>
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-slate-400" />Temporary Password</Label>
                <Input type="password" placeholder="Min 8 characters" value={onboardForm.password} onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })} />
                <p className="text-xs text-slate-400">Client should change this on first login</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />Phone (optional)</Label>
                  <Input placeholder="868-555-0000" value={onboardForm.phone} onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5 text-slate-400" />Max Applicants</Label>
                  <Input type="number" value={onboardForm.maxApplicants} onChange={(e) => setOnboardForm({ ...onboardForm, maxApplicants: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-slate-400" />Portal Domain</Label>
                <Select value={onboardForm.portalDomain} onValueChange={(v) => setOnboardForm({ ...onboardForm, portalDomain: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform.getnobis.com">platform.getnobis.com (General SaaS)</SelectItem>
                    <SelectItem value="portal.getnobis.com">portal.getnobis.com (TSTT / Dedicated)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">Which portal URL should the client use to log in</p>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setOnboardOpen(false)}>Cancel</Button>
                <Button onClick={runOnboard} disabled={onboarding || !isOnboardFormValid} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {onboarding ? <><Loader2 className="h-4 w-4 animate-spin" />Onboarding...</> : <><Shield className="h-4 w-4" />Onboard Client</>}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Client Modal (2-Step) ──────────────── */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {deleteResult ? (deleteResult.success ? "Client Removed" : "Delete Failed") : "Delete Client"}
            </DialogTitle>
            <DialogDescription>
              {deleteResult
                ? (deleteResult.success ? "All data has been permanently removed." : "Something went wrong.")
                : "This action is permanent and cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>

          {/* Delete Result */}
          {deleteResult ? (
            <div className="space-y-4 py-2">
              {deleteResult.success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-800">{deleteResult.message}</p>
                    {deleteResult.cleanup && (
                      <div className="mt-2 text-xs text-emerald-700 space-y-1">
                        <p>Auth0 Org deleted: {deleteResult.cleanup.auth0?.org ? "Yes" : "No"}</p>
                        <p>Applicants removed: {deleteResult.cleanup.mongo?.applicants || 0}</p>
                        <p>Verifications removed: {deleteResult.cleanup.mongo?.verifications || 0}</p>
                        <p>Audit events removed: {deleteResult.cleanup.mongo?.auditEvents || 0}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="font-medium text-red-800">{deleteResult.message}</p>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setDeleteOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : deleteStep === 1 ? (
            /* Step 1: Preview */
            <div className="space-y-4 py-2">
              {deleteLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : deletePreview?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{deletePreview.error}</div>
              ) : deletePreview ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-sm">{deletePreview.client.companyName}</p>
                    <p className="text-xs text-slate-400">{deletePreview.client.email}</p>
                    {deletePreview.client.auth0OrgId && (
                      <p className="text-xs text-slate-400">Auth0 Org: <span className="font-mono">{deletePreview.client.auth0OrgId}</span></p>
                    )}
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 mb-3">The following will be permanently deleted:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletePreview.willDelete.applicants} applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletePreview.willDelete.verifications} verifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletePreview.willDelete.auditEvents} audit events</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletePreview.willDelete.auth0Users} Auth0 users</span>
                      </div>
                      {deletePreview.willDelete.auth0Org && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Shield className="h-3.5 w-3.5" />
                          <span>Auth0 Organization will be deleted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteStep(2)}
                  disabled={deleteLoading || deletePreview?.error}
                >
                  Continue to Delete
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* Step 2: Type confirmation */
            <div className="space-y-4 py-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  To confirm deletion, type <span className="font-bold font-mono bg-red-100 px-1.5 py-0.5 rounded">{expectedConfirmText}</span> below:
                </p>
                <Input
                  placeholder={`Type "${expectedConfirmText}" to confirm`}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="border-red-300 focus:border-red-500"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteStep(1)}>Back</Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleting || deleteConfirmText !== expectedConfirmText}
                  className="gap-2"
                >
                  {deleting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Deleting...</>
                  ) : (
                    <><Trash2 className="h-4 w-4" />Permanently Delete</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
