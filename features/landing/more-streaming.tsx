import Image from "next/image";
import React from "react";

export const MoreStreaming = () => {
  const data = [
    "Spotlight local talent",
    "Preserve cultural narratives",
    "Elevate African cinema for both local and global audiences",
  ];

  return (
    <section className="relative w-full min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/image.png"
        alt="background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-end min-h-[700px] px-6 md:px-12 lg:px-20">
        <div className="max-w-xl lg:mr-20 space-y-8 p-6 md:p-10 rounded-2xl backdrop-blur-sm bg-black/30 shadow-xl">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#F78912]">
            More than <br />
            <span className="italic font-normal text-white">Streaming</span>
          </h1>

          {/* Intro Text */}
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            Zuimi is not just a platform to watch films. It is a growing media
            ecosystem built to:
          </p>

          {/* List */}
          <ul className="space-y-4">
            {data.filter(Boolean).map((item, index) => (
              <li key={index} className="flex items-start gap-4 group">
                {/* Custom Bullet */}
                <span className="mt-2 h-3 w-3 rounded-full bg-[#F78912] group-hover:scale-125 transition-transform duration-300" />

                {/* Text */}
                <span className="text-white text-base md:text-lg leading-relaxed group-hover:text-pink-200 transition-colors duration-300">
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
