"use client";

import { useEffect, useRef, useState } from "react";

// Minimal shape of the Google Identity Services client we rely on.
interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/**
 * Loads the Google Identity Services script once, initializes it with
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID, and renders the official "Sign in with
 * Google" button into the returned ref. `onToken` receives the id_token to
 * forward to POST /api/auth/google.
 */
export function useGoogleIdentity({ onToken }: { onToken: (idToken: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    function init() {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: (response) => onToken(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
      setReady(true);
    }

    if (window.google) {
      init();
      return;
    }

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
    // Intentionally not removing the script on unmount — it's cheap to keep
    // cached for other auth pages in the session.
  }, [onToken]);

  return { buttonRef, ready };
}
