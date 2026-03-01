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
      <nav className="sticky top-0 z-50 w-full px-6 md:px-12 lg:px-20 py-6 bg-linear-to-b from-black/90 via-black/70 to-transparent shadow-[0_6px_18px_rgba(0,0,0,0.22)]">
        {/* background layer */}
        <div className="absolute inset-0 bg-[url('/header-bg.svg')] bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none" />

        {/* content layer */}
        <div className="relative flex justify-between items-center">
          <Image
            src="/zuimi-logo.svg"
            alt="Zuimi logo"
            width={160}
            height={60}
            className="w-[89px] h-[24.43px] md:w-[148px] md:h-[40.62px]"
          />

          <a
            href="#contact"
            className="px-4 py-2 rounded-[4px] font-semibold text-sm bg-gradient-to-r group from-[#1683EE] via-[#F12F7A] to-[#F68812] hover:opacity-90 transition text-white flex items-center gap-1"
          >
            Join Us
            <ChevronRight className="group-hover:translate-x-1 duration-300 transition-transform w-[16px] h-[16px]" />
          </a>
        </div>
      </nav>

      {/* Centered Content */}
      <div className="flex lg:justify-center lg:min-h-[calc(100vh-100px)] px-6">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4 lg:gap-8 mt-10 lg:mt-35">
          <h1 className="-mb-4 text-[28px] md:text-[40px] lg:text-[50px] font-bold text-white tracking-0">
            <span className="italic font-normal font-alt">African</span>{" "}
            stories. <br /> Told with
            <span className="italic font-normal font-alt"> depth.</span>
            <br />
            <span className="italic font-normal font-alt">Shared</span> with the
            world.
          </h1>

          <p className="text-white/90 text-[12px] md:text-[20px] max-w-xl mx-auto -space-x-1">
            Zuimi is a streaming and media platform for powerful 
            <br />
            African storytelling built for film lovers and creators
          </p>

          <a
            href="#contact"
            className="px-4 py-2 mt-3 rounded-[8px] text-[18px] lg:text-[24px] font-semibold bg-gradient-to-r group from-[#1683EE] via-[#F12F7A] to-[#F68812] hover:opacity-90 md:text-[24px] text-white transition flex items-center gap-2 mb-[130px]"
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
