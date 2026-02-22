import Image from "next/image";
import React from "react";

export const MoreStreaming = () => {
  const data = [
    "Spotlight local talent",
    "Preserve cultural narratives",
    "Elevate African cinema for both local and global audiences",
  ];

  return (
    <section className="relative max-w-6xl mx-auto rounded-[16px]  w-full lg:min-h-[700px] h-[264.77px] sm:h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/image.png"
        alt="background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:hidden" />

      {/* Content */}
      <div className="relative z-10 flex justify-end min-h-[700px] p-6 lg:mt-25">
        <div className="max-w-[508px] space-y-2 lg:space-y-6 ">
          {/* Heading */}
          <h1 className="text-[24px] md:text-4xl lg:text-5xl font-bold leading-tight text-[#F78912]">
            More than <br className="hidden md:block" />
            <span className="italic font-normal font-alt">Streaming</span>
          </h1>

          {/* Intro Text */}
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            Zuimi is not just a platform to watch films. It is a growing media
            ecosystem built to:
          </p>

          {/* List */}
          <ul className="space-y-0.5">
            {data.filter(Boolean).map((item, index) => (
              <li key={index} className="flex items-start gap-1 md:gap-4 group">
                {/* Custom Bullet */}
                <span className="mt-2 h-3 w-3 rounded-full bg-[#F78912] group-hover:scale-125 transition-transform duration-300" />

                {/* Text */}
                <span className="text-white font-semibold text-[12px] md:text-lg leading-relaxed group-hover:text-pink-200 transition-colors duration-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
