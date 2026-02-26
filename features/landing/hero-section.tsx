"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden h-[452px] lg:h-full">
      {/* Background Image */}
      <Image
        src="/bg-image.jpg"
        alt="Zuimi background image"
        fill
        priority
        className="object-cover -z-10"
      />
      <Image
        src="/shade-gradient.svg"
        alt="Zuimi background image"
        fill
        priority
        className="object-cover -z-5"
      />

      <div className="absolute z-100 bottom-0 h-1  gradient w-full left-0 right-0" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full px-6 md:px-12 lg:px-20 py-6">
        {/* background layer */}
        <div className="absolute inset-0 bg-[url('/header-bg.svg')] bg-cover bg-center bg-no-repeat opacity-38 pointer-events-none" />

        {/* content layer */}
        <div className="relative flex justify-between items-center">
          <Image
            src="/zuimi-logo.svg"
            alt="Zuimi logo"
            width={160}
            height={60}
          />

          <a
            href="#contact"
            className="px-4 py-2 rounded-[4px] font-semibold text-sm bg-gradient-to-r group from-blue-500 via-pink-500 to-orange-400 hover:opacity-90 transition text-white flex items-center gap-1"
          >
            Join Us
            <ChevronRight className="group-hover:translate-x-1 duration-300 transition-transform w-[16px] h-[16px]" />
          </a>
        </div>
      </nav>

      {/* Centered Content */}
      <div className="flex lg:justify-center lg:min-h-[calc(100vh-100px)] px-6">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4 lg:gap-8 mt-10 lg:mt-35">
          <h1 className="text-[28px] md:text-5xl lg:text-[54px] font-bold text-white leading-[36px] lg:leading-[70px] tracking-0">
            <span className="italic font-normal font-alt">African</span>{" "}
            stories. <br /> Told with
            <span className="italic font-normal font-alt"> depth.</span>
            <br />
            <span className="italic font-normal font-alt">Shared</span> with the
            world.
          </h1>

          <p className="text-white/90 text-lg md:text-2xl max-w-xl mx-auto">
            Zuimi is a streaming and media platform for powerful African
            storytelling built for film lovers and creators
          </p>

          <a
            href="#contact"
            className="px-6 py-4 rounded-[8px] font-semibold text-base  bg-gradient-to-r group from-blue-500 via-pink-500 to-orange-400 hover:opacity-90 md:text-[24px] text-white transition flex items-center gap-2"
          >
            Join Us
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 duration-300 transition-transform"
            />
          </a>
        </div>
      </div>
    </section>
  );
};
