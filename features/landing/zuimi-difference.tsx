import Image from "next/image";
import React from "react";

export const ZuimiDifference = () => {
  return (
    <section className="relative w-full min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/image2.png"
        alt="background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-start min-h-125 px-6 md:px-12 lg:px-20 mt-20">
        <div className="max-w-xl lg:ml-20  space-y-6  p-6 md:p-10 rounded-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#F22F7A]">
            What makes <br /> Zuimi{" "}
            <span className="italic font-normal">different?</span>
          </h1>

          <p className="text-base md:text-lg text-white leading-relaxed">
            Zuimi is a platform built for both creators and viewers alike.
          </p>

          <p className="text-base md:text-lg text-white leading-relaxed">
            From small independent filmmakers to emerging production teams.
            Zuimi is designed to support growth, visibility, and fair
            opportunity for all.
          </p>
        </div>
      </div>
    </section>
  );
};
