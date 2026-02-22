import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, Shield } from "lucide-react";

export default function Login() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      setIsRedirecting(true);
      await loginWithRedirect({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          redirect_uri: `${window.location.origin}/callback`,
        },
      });
    } catch (e) {
      console.error("Auth0 login redirect failed:", e);
      setIsRedirecting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="w-screen h-screen flex">
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8 text-center">
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-10 w-10 text-slate-900" />
              <span className="text-3xl font-bold text-slate-900">NOBIS</span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ADMIN</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Super Admin Portal</h1>
            <p className="text-sm text-slate-500">Manage clients, plans, and platform settings</p>
          </div>
          <Button onClick={handleLogin} disabled={isRedirecting} className="w-full h-[52px] rounded-xl text-base font-medium gap-2 bg-slate-900 hover:bg-slate-800">
            {isRedirecting ? <><Loader2 className="h-5 w-5 animate-spin" />Redirecting...</> : <><LogIn className="h-5 w-5" />Sign In</>}
          </Button>
          <p className="text-xs text-slate-400 mt-6">Restricted to authorized administrators only.</p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 h-full bg-slate-900 items-center justify-center">
        <div className="text-center px-12">
          <Shield className="h-20 w-20 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Platform Control Center</h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto">Monitor clients, manage plans, and configure the NOBIS KYC platform.</p>
        </div>
      </div>
    </div>
  );
}
