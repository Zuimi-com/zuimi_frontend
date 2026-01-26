"use client";

import { AdminSection } from "@/types/admin";

type SidebarProps = {
  selected: AdminSection;
  onSelect: (section: AdminSection) => void;
};

type NavItem = {
  key: AdminSection;
  label: string;
  icon: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ selected, onSelect }: SidebarProps) {
  const items: NavItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: "newsletter-history",
      label: "Newsletter History",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      key: "compose-letter",
      label: "Compose Letter",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
    },
    {
      key: "subscribers-overview",
      label: "Subscribers overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-72 p-6">
      <div className="h-[75vh] bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col">
        <nav className="space-y-1">
          {items.map((item) => {
            const active = item.key === selected;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={cx(
                  "w-full text-left relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition",
                  active ? "zuimi-gradient text-white" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full zuimi-gradient" />
                )}
                {item.icon}
                <span className={cx("text-sm", active && "font-medium")}>{item.label}</span>
              </button>
            );
          })}

          <div className="mt-8 px-3">
            <p className="text-xs text-gray-400">events</p>
          </div>
        </nav>

        <div className="mt-auto pt-6">
          <button
            type="button"
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={() => alert("Wire logout action here")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
