import Image from "next/image";
import React from "react";

export const WhyZuimiExist = () => {
  return (
    <section className="relative w-full min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/image1.png"
        alt="background"
        fill
        priority
        className="object-cover"
      />

      {/* <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:hidden" /> */}
      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-end min-h-125 px-6 md:px-12 lg:px-20 mt-20">
        <div className="max-w-xl lg:mr-20  space-y-6  p-6 md:p-10 rounded-2xl bg-[#F22F7A]/40 md:bg-transparent">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-zuimi-blue">
            Why <span className="italic font-normal">Zuimi</span> exists
          </h1>

          <p className="text-base md:text-lg text-black leading-relaxed">
            African cinema is rich, diverse, and deeply human yet many of its
            stories struggle to find the right home.
          </p>

          <p className="text-base md:text-lg text-black leading-relaxed">
            Creators need more than exposure. Audiences need more accessibility
            to film content.
          </p>

          <p className="text-base md:text-lg text-black leading-relaxed">
            Zuimi exists to create a space where African stories are treated
            with care, cultural honesty, and creative respect from production to
            audience.
          </p>
        </div>
      </div>
    </section>
  );
};