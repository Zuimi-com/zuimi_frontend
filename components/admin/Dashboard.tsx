import DashboardStats from "@/features/dashboard/common/dashboard-stats";
import NewsletterHistory, {
  NewsletterRow,
} from "@/components/admin/NewsletterHistory";

export const newsletterRows: NewsletterRow[] = [
  {
    subject: "New African Films This Week",
    dateSent: "April 12, 2026",
    status: "Sent",
    openRate: "96%",
  },
  {
    subject: "Trending Movies You Should Watch",
    dateSent: "March 30, 2026",
    status: "Sent",
    openRate: "80%",
  },
  {
    subject: "New Releases This Week",
    dateSent: "March 12, 2026",
    status: "Draft",
  },
  {
    subject: "Top Picks for the Weekend",
    dateSent: "February 28, 2026",
    status: "Sent",
    openRate: "72%",
  },
  {
    subject: "Editor’s Choice: Must-See Films",
    dateSent: "February 10, 2026",
    status: "Draft",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl space-y-5">
      <DashboardStats />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Recent NewsLetter</h1>
        <NewsletterHistory rows={newsletterRows}/>
      </div>
    </div>
  );
}
