import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { PropsWithChildren } from "react";

const AdminDashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen  font-sans">
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
