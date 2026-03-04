"use client";

import { AdminSection } from "@/types/admin";
import { ReactNode } from "react";
import Header from "./Header";

type FrameProps = {
  selected: AdminSection;
  onSelect: (section: AdminSection) => void;
  children: ReactNode;
};

export default function Frame({ selected, onSelect, children }: FrameProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* <Sidebar selected={selected} onSelect={onSelect} /> */}

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
