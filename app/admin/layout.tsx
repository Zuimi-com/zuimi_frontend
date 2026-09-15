import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import AdminRouteGuard from "@/features/dashboard/common/admin-auth-guard";
import { PropsWithChildren } from "react";

const AdminDashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <AdminRouteGuard>
      <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 font-sans">
        <div className="shrink-0">
          <Header />
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminDashboardLayout;
