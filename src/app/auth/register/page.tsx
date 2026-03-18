// app/auth/register/page.tsx
import AuthPageWrapper from "@/components/forms/AuthPageWrapper";

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const defaultRole = searchParams.role === "PROVIDER" ? "PROVIDER" : "PARENT";
  return <AuthPageWrapper page="register" defaultRole={defaultRole} />;
}
