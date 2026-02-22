import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, DollarSign } from "lucide-react";

export default function Plans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/plans")
      .then((res) => setPlans(res.data.plans || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plans & Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage subscription plans and pricing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-4">
                <DollarSign className="h-5 w-5 text-slate-400" />
                <span className="text-3xl font-bold text-slate-900">{plan.price?.toFixed(2)}</span>
                <span className="text-sm text-slate-400">/ verification</span>
              </div>
              <Badge variant="secondary">{plan.id}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
