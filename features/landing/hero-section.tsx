"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/bg-image.png"
        alt="Zuimi background image"
        fill
        priority
        className="object-cover -z-10"
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 lg:px-20 py-6">
        <Image src="/zuimi-logo.svg" alt="Zuimi logo" width={160} height={60} />

        <a
          href="#contact"
          className="px-8 py-3 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-blue-500 via-pink-500 to-orange-400 hover:opacity-90 transition flex items-center gap-2"
        >
          Join Us
          <ChevronRight size={18} />
        </a>
      </nav>

      {/* Centered Content */}
      <div className="flex justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="relative z-10 max-w-4xl text-center flex flex-col items-center gap-8 mt-35">
          <h1 className="text-2xl md:text-5xl lg:text-[54px] font-bold text-white leading-tight">
            African stories. Told with depth.
            <br />
            Shared with the world.
          </h1>

          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            Zuimi is a streaming and media platform for powerful African
            storytelling built for film lovers and creators
          </p>

          <a
            href="#contact"
            className="px-8 py-3 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-blue-500 via-pink-500 to-orange-400 hover:opacity-90 transition flex items-center gap-2"
          >
            Join Us
            <ChevronRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};
