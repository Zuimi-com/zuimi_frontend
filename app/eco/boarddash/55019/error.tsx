"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-8">
      <div>
        <h1 className="text-2xl font-bold">
          The workspace is temporarily unavailable.
        </h1>
        <p className="my-4 text-slate-300">
          Your changes have not been submitted. Check your connection or admin
          session and retry.
        </p>
        <button onClick={reset} className="rounded-lg bg-blue-600 px-5 py-3">
          Try again
        </button>
        <a href="/admin-login" className="ml-6 underline">
          Admin sign-in
        </a>
      </div>
    </main>
  );
}
