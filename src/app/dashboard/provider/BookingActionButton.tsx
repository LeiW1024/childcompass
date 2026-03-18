"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingActionButton({ bookingId, action, label, variant = "primary" }: {
  bookingId: string; action: string; label: string; variant?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all hover:scale-105 disabled:opacity-50 ${
        variant === "danger"
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
      }`}
    >
      {loading ? "…" : label}
    </button>
  );
}
