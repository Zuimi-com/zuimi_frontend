"use client"
import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";

export default function Header() {

  const { admin, loading } = useAdminAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = admin?.email ?? "";

  return (
    <header className="zuimi-gradient px-6 py-4 flex items-center justify-between">
      <div className="bg-[linear-gradient(to_right,#1683EE,#F12F7A,#F68812)]  bg-clip-text text-transparent text-3xl font-extrabold">
        zuimi
      </div>


      <div className="flex items-center gap-2 text-white">
        {loading ? (

           <>
              <div className="w-8 h-8 rounded-full bg-white/50 animate-pulse" />
              <div className="h-4 w-16 bg-white/50 rounded animate-pulse" />
            </>

             ) : admin ? (

              <>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {getInitials(displayName)}
                  </span>
                </div>
              
                </>
          ) : (

             <>
              <div className="w-8 h-8 rounded-full bg-white/80" />
              <span className="text-sm">Guest</span>
            </>
          )}
      </div>
    </header>
  );
}
