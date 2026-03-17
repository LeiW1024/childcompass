"use client";

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function TodayDate() {
  const today = getTodayISO();
  return (
    <time data-testid="today-date" dateTime={today}>
      {today}
    </time>
  );
}
