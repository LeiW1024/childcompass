// app/auth/error/page.tsx
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message ?? "Something went wrong during sign in.";
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Authentication error</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{message}</p>
      </div>
      <div className="flex flex-col gap-3">
        <a href="/auth/login"
          className="inline-flex items-center justify-center bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition">
          Back to sign in
        </a>
        <a href="/auth/register"
          className="inline-flex items-center justify-center border border-border font-bold px-6 py-3 rounded-xl hover:bg-muted transition text-sm">
          Create new account
        </a>
      </div>
    </div>
  );
}
