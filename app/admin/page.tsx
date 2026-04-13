import CatalogManagementSection from "@/components/admin/CatalogManagementSection";
import DashboardStats from "@/features/dashboard/common/dashboard-stats";

export const generateMetadata = () => {
  return {
    title: "Admin Dashboard",
  };
};

const AdminHomePage = () => {
  return (
    <div className="w-full space-y-5">
      <DashboardStats />
      <CatalogManagementSection />
    </div>
  );
};

export default AdminHomePage;
