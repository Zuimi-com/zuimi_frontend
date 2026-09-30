"use client";

import {
  AdminTutorialDefinition,
  AdminTutorialProgress,
  adminTutorialById,
  adminTutorialProgressKey,
  normalizeAdminTutorialProgress,
  tutorialsForRoute,
  visibleAdminTutorials,
} from "@/lib/tutorials/adminTutorials";
import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AdminGuidedTutorialOverlay from "./AdminGuidedTutorialOverlay";

type AdminTutorialContextValue = {
  activeTutorial: AdminTutorialDefinition | null;
  stepIndex: number;
  demoState?: string;
  isPlayback: boolean;
  pageTutorials: AdminTutorialDefinition[];
  visibleTutorials: AdminTutorialDefinition[];
  startTutorial: (tutorial: AdminTutorialDefinition, initialStep?: number) => void;
  closeTutorial: () => void;
  readProgress: (tutorial: AdminTutorialDefinition) => AdminTutorialProgress;
};

const AdminTutorialContext = createContext<AdminTutorialContextValue | null>(null);

export function AdminTutorialProvider({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const capabilities = admin?.capabilities ?? {};
  const requestedTutorial = adminTutorialById(searchParams.get("tutorial"));
  const activeTutorial =
    requestedTutorial &&
    requestedTutorial.route === pathname &&
    (!requestedTutorial.capability || capabilities[requestedTutorial.capability])
      ? requestedTutorial
      : null;
  const requestedStep = Number(searchParams.get("step") || 0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!activeTutorial) {
      setStepIndex(0);
      return;
    }
    const lastStep = Math.max(0, activeTutorial.steps.length - 1);
    setStepIndex(Math.min(lastStep, Math.max(0, requestedStep || 0)));
  }, [activeTutorial, requestedStep]);

  const progressKey = useCallback(
    (tutorial: AdminTutorialDefinition) =>
      adminTutorialProgressKey(admin?.id || "anonymous", tutorial),
    [admin?.id],
  );

  const readProgress = useCallback(
    (tutorial: AdminTutorialDefinition) => {
      if (typeof window === "undefined") {
        return normalizeAdminTutorialProgress(null, tutorial.steps.length);
      }
      try {
        return normalizeAdminTutorialProgress(
          JSON.parse(localStorage.getItem(progressKey(tutorial)) || "null"),
          tutorial.steps.length,
        );
      } catch {
        return normalizeAdminTutorialProgress(null, tutorial.steps.length);
      }
    },
    [progressKey],
  );

  const writeProgress = useCallback(
    (
      tutorial: AdminTutorialDefinition,
      status: AdminTutorialProgress["status"],
      step: number,
    ) => {
      try {
        localStorage.setItem(
          progressKey(tutorial),
          JSON.stringify({ status, step, updatedAt: new Date().toISOString() }),
        );
      } catch {
        // Playback still works if browser storage is unavailable.
      }
    },
    [progressKey],
  );

  const startTutorial = useCallback(
    (tutorial: AdminTutorialDefinition, initialStep = 0) => {
      const params = new URLSearchParams();
      params.set("tutorial", tutorial.id);
      params.set("step", String(initialStep));
      router.push(`${tutorial.route}?${params.toString()}`);
    },
    [router],
  );

  const closeTutorial = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tutorial");
    params.delete("step");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const pageTutorials = useMemo(
    () => tutorialsForRoute(pathname, capabilities),
    [capabilities, pathname],
  );
  const tutorials = useMemo(
    () => visibleAdminTutorials(capabilities),
    [capabilities],
  );

  const value = useMemo<AdminTutorialContextValue>(
    () => ({
      activeTutorial,
      stepIndex,
      demoState: activeTutorial?.steps[stepIndex]?.demoState,
      isPlayback: Boolean(activeTutorial),
      pageTutorials,
      visibleTutorials: tutorials,
      startTutorial,
      closeTutorial,
      readProgress,
    }),
    [
      activeTutorial,
      closeTutorial,
      pageTutorials,
      readProgress,
      startTutorial,
      stepIndex,
      tutorials,
    ],
  );

  return (
    <AdminTutorialContext.Provider value={value}>
      {children}
      {activeTutorial ? (
        <AdminGuidedTutorialOverlay
          tutorial={activeTutorial}
          stepIndex={stepIndex}
          onStepChange={(nextStep) => {
            setStepIndex(nextStep);
            writeProgress(activeTutorial, "in_progress", nextStep);
          }}
          onClose={() => {
            writeProgress(activeTutorial, "in_progress", stepIndex);
            closeTutorial();
          }}
          onSkip={() => {
            writeProgress(activeTutorial, "skipped", stepIndex);
            closeTutorial();
          }}
          onComplete={() => {
            writeProgress(activeTutorial, "completed", stepIndex);
            closeTutorial();
          }}
        />
      ) : null}
    </AdminTutorialContext.Provider>
  );
}

export function useAdminTutorial() {
  const context = useContext(AdminTutorialContext);
  if (!context) {
    throw new Error("useAdminTutorial must be used within AdminTutorialProvider");
  }
  return context;
}

