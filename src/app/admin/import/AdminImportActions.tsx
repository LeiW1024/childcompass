"use client";
// Publish / Delete buttons for each pending listing
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminImportActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "delete" | null>(null);

  async function publish() {
    setLoading("publish");
    await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: true }),
    });
    setLoading(null);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this listing permanently?")) return;
    setLoading("delete");
    await fetch(`/api/admin/listings/${listingId}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button onClick={publish} disabled={loading !== null}
        className="bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-60 whitespace-nowrap">
        {loading === "publish" ? "…" : "✅ Publish"}
      </button>
      <button onClick={remove} disabled={loading !== null}
        className="bg-white border border-border text-destructive font-bold text-sm px-4 py-2 rounded-xl hover:bg-destructive/5 transition disabled:opacity-60 whitespace-nowrap">
        {loading === "delete" ? "…" : "🗑 Delete"}
      </button>
    </div>
  );
}
