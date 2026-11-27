import AdminHome from "@/features/dashboard/common/admin-home";

export const generateMetadata = () => {
  return {
    title: "Admin Dashboard",
  };
};

const AdminHomePage = () => {
  return (
    <div className="w-full space-y-5">
      <AdminHome />
    </div>
  );
};

export default AdminHomePage;
