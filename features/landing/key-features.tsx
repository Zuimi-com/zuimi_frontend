import React from "react";
import Image from "next/image";
import { JoinWaitlistCard } from "./join-waitlist-card";

const data = [
  {
    icon: "/movie-icon.svg",
    title: "Premium African Content",
    desc: "Access a curated library of high-quality African films.",
  },
  {
    icon: "/desktop.svg",
    title: "Multi-Device Support",
    desc: "Seamlessly switch between your phone, tablet, laptop and smart TV.",
  },
  {
    icon: "/Reward.svg",
    title: "Rewarding Filmmakers",
    desc: "Our ecosystem ensures creators are fairly compensated and celebrated for their incredible work.",
  },
  {
    icon: "/globe-sphere.svg",
    title: "Local Roots, Global Reach",
    desc: "Proudly Nigerian built with the ambition to showcase African cinema to the world.",
  },
];

export const KeyFeatures = () => {
  return (
    <section className="min-h-screen flex flex-col space-y-20 items-center justify-center px-6 pb-20 pt-10">
      <div className="max-w-7xl w-full flex flex-col items-center text-center space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl md:text-[32px] font-bold text-white text-pretty">
            Everything You Need for the Perfect Streaming Experience
          </h1>
          <p className="text-white text-2xl">
            We are building the ultimate platform for movie enthusiasts with
            features designed to enhance your viewing experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-transparent rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col text-left space-y-4 border-2 border-white"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zuimi-blue">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>

              <h3 className="text-lg text-left font-semibold text-white">
                {item.title}
              </h3>

              <p className="text-sm text-white leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <JoinWaitlistCard />
    </section>
  );
};
