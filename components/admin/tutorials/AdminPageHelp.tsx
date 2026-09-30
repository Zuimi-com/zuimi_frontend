"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAdminTutorial } from "./AdminTutorialProvider";

export default function AdminPageHelp() {
  const { pageTutorials, startTutorial, isPlayback } = useAdminTutorial();
  const [open, setOpen] = useState(false);

  if (!pageTutorials.length) return null;

  return (
    <div className="relative" data-tutorial="admin-page-help">
      <button
        type="button"
        onClick={() => !isPlayback && setOpen((value) => !value)}
        disabled={isPlayback}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-default"
        aria-expanded={open}
      >
        <BookOpen className="h-4 w-4" />
        Page Help
        {pageTutorials.length > 1 ? <ChevronDown className="h-4 w-4" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {pageTutorials.map((tutorial) => (
            <button
              key={tutorial.id}
              type="button"
              onClick={() => {
                setOpen(false);
                startTutorial(tutorial);
              }}
              className="w-full rounded-lg px-3 py-3 text-left hover:bg-slate-50"
            >
              <span className="block text-sm font-semibold text-slate-900">
                {tutorial.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {tutorial.description}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

