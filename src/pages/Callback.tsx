import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Callback() {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    const complete = async () => {
      if (!isLoading && isAuthenticated && !done.current) {
        done.current = true;
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("sa_token", token);
        } catch {}
        navigate("/dashboard", { replace: true });
      }
    };
    complete();
  }, [isLoading, isAuthenticated, navigate, getAccessTokenSilently]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4 text-slate-500">{error ? `Error: ${error.message}` : "Completing sign-in..."}</p>
      </div>
    </div>
  );
}
