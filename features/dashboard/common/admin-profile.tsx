"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminProfile = () => {
  return (
    <div className="flex items-center gap-3 p-3">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt="Admin profile image"
        />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>

      <span className="text-lg font-semibold text-white">Admin User</span>
    </div>
  );
};

export default AdminProfile;
