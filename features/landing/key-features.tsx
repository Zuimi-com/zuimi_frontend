"use client";
import Image from "next/image";
import React from "react";

const data = [
  {
    icon: "/movie.svg",
    title: "Premium African Content",
    color: "#F78912",
    desc: "Access a curated library of high-quality African films.",
  },
  {
    icon: "/television.svg",
    title: "Enjoy streaming everywhere ",
    color: "#F22F7A",
    desc: "SSeamlessly switch between your phone, Tablet, Laptop and Smart TV.",
  },
  {
    icon: "/download.svg",
    title: "Download movies to watch offline",
    color: "#1684EF",
    desc: "Save your favorite movies offline for to wath later..",
  },
  {
    icon: "/community.svg",
    color: "#F78912",
    title: "Community Interaction",
    desc: "Join communities discussing films to get closer to your favorite filmmakers and fans.",
  },
];

export const KeyFeatures: React.FC = () => {
  return (
    <section className="flex flex-col" id="features">
      <div className="w-full bg-linear-to-b from-[#000000] to-[#101727] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12 ">
          <div className="max-w-3xl space-y-[40px] mx-auto">
            <h1 className="font-bold text-white text-center text-pretty text-[32px] md:text-[50px] leading-tight max-w-[820px] mx-auto">
              Everything You Need for the Perfect Streaming Experience
            </h1>
            <p className="text-white text-2xl text-center">
              We are building the ultimate platform for movie enthusiasts with
              features designed to enhance your viewing experience.
            </p>
          </div>

          {/* Features Grid (POP UP ON SCROLL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full mt-10 md:mt-20">
            {data.map((item, index) => (
              <div
                key={index}
                // style={{ "--hoverColor": item.color } as React.CSSProperties} hover:bg-[var(--hoverColor)]
                className="bg-[#2D2D2D] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left space-y-1 hover:-translate-y-2 "
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={46.67}
                  height={46.67}
                  className="mb-9.75"
                />

                <h3 className="text-lg md:text-2xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="text-sm md:text-base text-white group-hover:font-semibold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {/* <div className="bg-linear-to-b to-[#000000] from-[#101727] py-16 px-6">
        <JoinWaitlistCard />
      </div> */}
    </section>
  );
};
