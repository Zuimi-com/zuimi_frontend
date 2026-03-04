import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import AdminRouteGuard from "@/features/dashboard/common/admin-auth-guard";
import { PropsWithChildren } from "react";

const AdminDashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <AdminRouteGuard>
      <div className="min-h-screen  font-sans">
        <Header />
        <div className="flex min-h-[calc(100vh-64px)]">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminDashboardLayout;
