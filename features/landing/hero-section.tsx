import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import React from "react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/background.svg"
        alt="Zuimi background image"
        fill
        priority
        className="object-cover"
      />
      <Image
        src="/zuimi-logo.svg"
        alt="Zuimi logo"
        width={200}
        height={100}
        className="object-cover absolute left-1/2 -translate-x-1/2 top-10"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-6 text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 rounded-full bg-[#313e6b] border px-4 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Coming Soon</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Your Next Favorite Movie Is Just One Click Away
        </h1>

        <p className="text-neutral-200 text-lg md:text-xl max-w-3xl">
          Zuimi is building the future of African cinema. A streaming platform
          with local roots and global ambition that celebrates our stories,
          rewards our filmmakers, and delivers the ultimate film experience.
        </p>

        {/* Email Input + Button */}
        <div className="flex w-full max-w-md flex-col sm:flex-row gap-3 mt-4">
          <Input
            placeholder="Enter your email"
            className="bg-[#313e6b] text-white placeholder:text-white"
          />
          <Button className="flex items-center gap-2 bg-zuimi-blue h-12 hover:bg-zuimi-blue">
            Join Waitlist
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-base text-neutral-300 mt-2">
          Join the movement to strengthen African cinema
        </p>
      </div>
    </section>
  );
};
