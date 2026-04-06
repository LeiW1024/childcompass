"use client";
// Claim button — only shown when user is logged in
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimButton({ token, providerName }: { token: string; providerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setLoading(true); setError(null);
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/dashboard/provider?claimed=true");
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-primary p-7 text-center space-y-4">
      <p className="font-extrabold text-lg">You&apos;re signed in — ready to claim!</p>
      <p className="text-sm text-muted-foreground">
        By claiming, you confirm that you represent <strong>{providerName}</strong> and agree to our terms.
      </p>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <button onClick={handleClaim} disabled={loading}
        className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl hover:bg-primary/90 transition disabled:opacity-60 text-base">
        {loading ? "Claiming…" : `✅ Claim ${providerName}`}
      </button>
    </div>
  );
}
