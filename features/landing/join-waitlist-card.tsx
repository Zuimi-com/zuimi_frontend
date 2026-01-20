import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Mail } from "lucide-react";
import React from "react";

export const JoinWaitlistCard = () => {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl p-8 md:p-12 text-center text-white shadow-xl bg-linear-to-br from-[#1683EE] via-[#F12F7A] to-[#F68812] from-[10%] via-[50%] to-[80%]">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
        <Mail className="h-6 w-6 text-white" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Join the Zuimi Movement
      </h2>

      {/* Description */}
      <p className="text-white/90 max-w-xl mx-auto mb-8 text-base md:text-lg">
        Be part of the community strengthening African cinema. Sign up to get
        exclusive access and updates on Zuimi.
      </p>

      {/* Input + Button */}
      <div className="mx-auto flex max-w-xl flex-col sm:flex-row gap-3 mb-4 items-center">
        <Input
          placeholder="Enter your email"
          className=" bg-white text-neutral-900 placeholder:text-black h-16 placeholder:text-[20px]"
        />
        <Button className="h-12 bg-white text-blue-600 hover:bg-neutral-100 flex items-center gap-2">
          Join Waitlist
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer text */}
      <p className="text-sm text-white/80">
        No spam, unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
};
