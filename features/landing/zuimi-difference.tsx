import Image from "next/image";
import React from "react";

export const ZuimiDifference = () => {
  return (
    <section className="relative max-w-6xl mx-auto rounded-[16px]  w-full lg:min-h-[700px] h-[264.77px] sm:h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/image2.png"
        alt="background"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent lg:hidden" />

      {/* Content Container */}
      <div className="relative z-10 flex lg:items-center justify-start min-h-125 p-6 md:px-12 lg:px-20 lg:mt-20">
        <div className="max-w-[508px] space-y-2 lg:space-y-6  md:p-10 rounded-2xl">
          <h1 className="text-[24px] md:text-[32px] lg:text-[52px] font-extrabold leading-tight text-[#F22F7A] -tracking-[2.5px]">
            What makes <br /> Zuimi{" "}
            <span className="italic font-normal font-alt">different?</span>
          </h1>

          <p className="text-[12px] font-semibold md:text-[20px] text-white leading-relaxed">
            Zuimi is a platform built for both creators and viewers alike.
          </p>

          <p className="text-[12px] font-semibold md:text-[20px] text-white leading-relaxed">
            From small independent filmmakers to emerging production teams.
            Zuimi is designed to support growth, visibility, and fair
            opportunity for all.
          </p>
        </div>
      </div>
    </section>
  );
};
