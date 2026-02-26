import Image from "next/image";
import React from "react";

export const WhyZuimiExist = () => {
  return (
    <section
      id="about"
      className="relative max-w-6xl mx-auto rounded-[16px]  w-full lg:min-h-[700px] h-[264.77px] sm:h-[500px] overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="/image1.jpg"
        alt="background"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:hidden" />
      {/* Content Container */}
      <div className="relative  z-10 flex justify-end min-h-125 lg:mt-30">
        <div className="max-w-[508px] space-y-2 lg:space-y-6  p-10 rounded-2xl lg:mr-30">
          <h1 className="text-[24px] md:text-4xl lg:text-5xl font-bold leading-tight text-zuimi-blue">
            Why <span className="italic font-normal font-alt">Zuimi</span> exists
          </h1>

          <div className="space-y-2 text-white font-semibold md:text-black">
            <p className="text-[12px] md:text-lg  leading-relaxed">
              African cinema is rich, diverse, and deeply human yet many of its
              stories struggle to find the right home.
            </p>

            <p className="text-[12px] md:text-lg leading-relaxed">
              Creators need more than exposure. Audiences need more
              accessibility to film content.
            </p>

            <p className="text-[12px] md:text-lg  leading-relaxed">
              Zuimi exists to create a space where African stories are treated
              with care, cultural honesty, and creative respect from production
              to audience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
