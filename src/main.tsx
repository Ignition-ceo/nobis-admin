import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

console.log("Auth0 config:", { domain, clientId, audience });

if (!domain || !clientId) {
  document.getElementById("root")!.innerHTML = `
    <div style="padding:40px;font-family:sans-serif">
      <h2>Missing Auth0 Configuration</h2>
      <p>VITE_AUTH0_DOMAIN: ${domain || "NOT SET"}</p>
      <p>VITE_AUTH0_CLIENT_ID: ${clientId || "NOT SET"}</p>
      <p>VITE_AUTH0_AUDIENCE: ${audience || "NOT SET"}</p>
      <p>Make sure environment variables are set in Netlify and redeploy.</p>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: `${window.location.origin}/callback`,
          audience: audience,
        }}
        cacheLocation="localstorage"
      >
        <App />
      </Auth0Provider>
    </StrictMode>
  );
}
