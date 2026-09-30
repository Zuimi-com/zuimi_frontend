"use client";

import { AdminTutorialDefinition } from "@/lib/tutorials/adminTutorials";
import { BookOpen, CheckCircle2, ChevronDown, Clock3, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAdminTutorial } from "./AdminTutorialProvider";

const STATUS = {
  not_started: { label: "Not started", className: "bg-slate-100 text-slate-700", Icon: Clock3 },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800", Icon: Clock3 },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
  skipped: { label: "Skipped", className: "bg-slate-100 text-slate-700", Icon: Clock3 },
};

export default function AdminTutorialsHub() {
  const { visibleTutorials, readProgress, startTutorial } = useAdminTutorial();
  const [revision, setRevision] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => setRevision((value) => value + 1), [visibleTutorials]);

  const categories = useMemo(
    () =>
      Array.from(
        visibleTutorials.reduce((groups, tutorial) => {
          const current = groups.get(tutorial.category) || [];
          current.push(tutorial);
          groups.set(tutorial.category, current);
          return groups;
        }, new Map<string, AdminTutorialDefinition[]>()),
      ),
    [visibleTutorials],
  );

  return (
    <section className="mx-auto max-w-5xl space-y-8" data-progress-revision={revision}>
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Learn at your pace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              Tutorials & Help
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Follow guided walkthroughs on the real Zuimi interface. Tutorials use local demo data and never submit, upload, send, publish, change access, or sign you out.
            </p>
          </div>
        </div>
      </div>

      {categories.map(([category, tutorials]) => {
        const isCollapsed = collapsed[category] === true;
        const completed = tutorials.filter(
          (tutorial) => readProgress(tutorial).status === "completed",
        ).length;
        return (
          <section key={category} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 sm:px-5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              onClick={() =>
                setCollapsed((current) => ({ ...current, [category]: !isCollapsed }))
              }
              aria-expanded={!isCollapsed}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Tutorial section
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{category}</h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{completed} of {tutorials.length} completed</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </div>
            </button>

            {!isCollapsed ? (
              <div className="space-y-4 pb-5">
                {tutorials.map((tutorial) => {
                  const progress = readProgress(tutorial);
                  const status = STATUS[progress.status];
                  const StatusIcon = status.Icon;
                  const replay = progress.status === "completed" || progress.status === "skipped";
                  const resume = progress.status === "in_progress";
                  return (
                    <article key={tutorial.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div className="max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {tutorial.steps.length} steps
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {tutorial.duration}
                            </span>
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-slate-950">{tutorial.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{tutorial.description}</p>
                          {resume ? (
                            <p className="mt-3 text-xs font-semibold text-amber-700">
                              Continue from step {progress.step + 1} of {tutorial.steps.length}.
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => startTutorial(tutorial, resume ? progress.step : 0)}
                          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          {replay ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {replay ? "Replay tutorial" : resume ? "Continue tutorial" : "Start tutorial"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </section>
  );
}

