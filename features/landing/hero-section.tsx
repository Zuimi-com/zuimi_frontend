"use client";

import React from "react";
import Image from "next/image";
<<<<<<< HEAD
=======
import { motion, Variants } from "framer-motion";
>>>>>>> 9caa74f3c8fac796bcf3d58965cc8d8cbba8e4a4
import { ChevronRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <Image
        src="/background.svg"
        alt="Zuimi background image"
        fill
        priority
        className="object-cover"
      />

      <Image src="/zuimi-logo.svg" alt="Zuimi logo" width={200} height={100} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-6 lg:px-0 text-center flex flex-col items-center gap-6">
        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full bg-[#313e6b] border px-4 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-white">Coming Soon</span>
        </div>

        <h1 className="text-[32px] md:text-[40px] font-bold text-white leading-tight max-w-123">
          Your Next Favorite Movie Is Just One Click Away
        </h1>

        <p className="text-white text-[20px] md:text-[24px] max-w-205.75">
          Zuimi is building the future of African cinema. A streaming platform
          with local roots and global ambition that celebrates our stories,
          rewards our filmmakers, and delivers the ultimate film experience.
        </p>

        <div className="flex w-full max-w-md flex-col sm:flex-row gap-3 mt-4 items-center">
          <input
            placeholder="Enter your email"
            className="bg-[#313e6b] text-white placeholder:text-white h-16 placeholder:text-[20px]"
          />

          <div className="w-full sm:w-auto">
            <button className="flex items-center gap-2 bg-zuimi-blue h-12 w-full hover:bg-zuimi-blue text-base">
              Join Waitlist
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-base text-neutral-300 mt-2">
          🎬 Join the movement to strengthen African cinema
        </p>
      </div>
    </section>
  );
};
