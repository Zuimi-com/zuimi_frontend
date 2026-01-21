"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  SquarePen,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Newsletter History",
    url: "/dashboard/newsletter",
    icon: FileText,
  },
  {
    title: "Compose Letter",
    url: "/dashboard/compose-letter",
    icon: SquarePen,
  },
  {
    title: "Subscribers Overview",
    url: "/dashboard/subscribers",
    icon: Users,
  },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  return (
    <Sidebar className="top-20 w-75 left-5 h-[90%] rounded-2xl border overflow-hidden">
      <SidebarContent>
        <SidebarGroupContent className="">
          <SidebarGroup className="">
            <SidebarMenu className="space-y-2">
              {navLinks.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "py-7",
                      pathname === item.url && "bg-black text-white",
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="text-base font-medium tracking-tight">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <Button className="h-16 bg-transparent hover:bg-transparent text-black flex justify-start items-center">
          <LogOut />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
