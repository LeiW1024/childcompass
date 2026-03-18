"use client";
// components/forms/LoginForm.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/ui/LanguageSwitcher";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useLang();
  const de = lang === "de";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const inp = "w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(de ? "E-Mail oder Passwort falsch." : error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-muted-foreground block mb-2">
          {de ? "E-Mail-Adresse" : "Email address"}
        </label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder={de ? "name@beispiel.de" : "jane@example.com"} className={inp} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-muted-foreground">
            {de ? "Passwort" : "Password"}
          </label>
          <a href="/auth/forgot-password" className="text-sm text-primary font-semibold hover:underline">
            {de ? "Passwort vergessen?" : "Forgot password?"}
          </a>
        </div>
        <div className="relative">
          <input type={showPass ? "text" : "password"} required value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inp} />
          <button type="button" onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground font-semibold">
            {showPass ? (de ? "Verbergen" : "Hide") : (de ? "Zeigen" : "Show")}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-primary text-white font-bold py-3 rounded-xl text-base hover:bg-primary/90 transition disabled:opacity-60 mt-1">
        {loading ? (de ? "Wird angemeldet…" : "Signing in…") : (de ? "Anmelden →" : "Sign in →")}
      </button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-muted-foreground">{de ? "oder" : "or"}</span>
        </div>
      </div>

      <button type="button" onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 border border-border rounded-xl py-3 text-base font-semibold hover:bg-muted transition disabled:opacity-60">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {de ? "Mit Google anmelden" : "Continue with Google"}
      </button>
    </form>
  );
}
