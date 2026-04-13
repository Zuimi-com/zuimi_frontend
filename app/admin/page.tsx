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
    </div>
  );
};

export default AdminHomePage;
