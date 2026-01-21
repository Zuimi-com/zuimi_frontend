import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/features/dashboard/common/dashboard-navbar";
import DashboardSidebar from "@/features/dashboard/common/dashboard-sidebar";
import { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <DashboardNavbar />
      <SidebarProvider>
        <div className="flex w-full">
          <DashboardSidebar />
          <section className="flex-1 w-full ml-20 mt-5 pb-10">
            <div className="px-5 flex-1 w-full">{children}</div>
          </section>
        </div>
      </SidebarProvider>
    </main>
  );
};

export default DashboardLayout;
