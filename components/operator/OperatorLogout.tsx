"use client";

export default function OperatorLogout() {
  return <button className="underline" onClick={async () => {
    await fetch("/api/operator/session", { method: "DELETE" });
    location.href = "/operator/login";
  }}>Sign out</button>;
}
