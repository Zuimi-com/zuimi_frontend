import NewsLetterSection from "@/components/admin/NewsLetterSection";
import DashboardStats from "@/features/dashboard/common/dashboard-stats";

const AdminHomePage = () => {
  return (
    <div className="w-full space-y-5">
      <DashboardStats />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Recent NewsLetter</h1>
        <NewsLetterSection />
      </div>
    </div>
  );
};

export default AdminHomePage;
