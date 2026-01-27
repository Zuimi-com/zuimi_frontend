"use client";

import { useEffect, useMemo, useState } from "react";
import Frame from "@/components/admin/Frame";
import NewsletterHistory from "@/components/admin/NewsletterHistory";
import Dashboard from "@/components/admin/Dashboard";
import ComposeLetter from "@/components/admin/ComposeLetter";
import SubscribersOverview from "@/components/admin/SubscribersOverview";
import SectionSkeleton from "@/components/admin/SectionSkeleton";
import { AdminSection } from "@/types/admin";

export default function AdminPage() {
    const [selected, setSelected] = useState<AdminSection>("newsletter-history");
    const [loading, setLoading] = useState(false);

    // Fake loading when switching sections
    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 550);
        return () => clearTimeout(t);
    }, [selected]);

    const content = useMemo(() => {
        switch (selected) {
            case "dashboard":
                return <Dashboard />;
            case "newsletter-history":
                return <NewsletterHistory />;
            case "compose-letter":
                return <ComposeLetter />;
            case "subscribers-overview":
                return <SubscribersOverview />;
            default:
                return <NewsletterHistory />;
        }
    }, [selected]);

    return (
        <>
            {/* Global gradient class */}
            <style jsx global>{`
        .zuimi-gradient {
          background: linear-gradient(180deg, #000000 0%, #101727 100%);
        }
      `}</style>

            <Frame selected={selected} onSelect={setSelected}>
                {loading ? <SectionSkeleton /> : content}
            </Frame>
        </>
    );
}
