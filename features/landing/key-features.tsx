"use client";

import React from "react";
import Image from "next/image";
<<<<<<< HEAD
=======
import { motion, Variants } from "framer-motion";
>>>>>>> 9caa74f3c8fac796bcf3d58965cc8d8cbba8e4a4
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

export const KeyFeatures: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col">
      <div className="w-full bg-linear-to-b from-[#000000] to-[#101727] py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 ">
          <div className="max-w-3xl space-y-8 mx-auto">
            <h1 className="font-bold text-white text-center text-pretty text-[32px] md:text-[40px]">
              Everything You Need for the Perfect Streaming Experience
            </h1>
            <p className="text-white text-2xl text-center">
              We are building the ultimate platform for movie enthusiasts with
              features designed to enhance your viewing experience.
            </p>
          </div>

          {/* Features Grid (POP UP ON SCROLL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-10 md:mt-20">
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
                  />
                </div>

                <h3 className="text-lg font-semibold text-zuimi-gray">
                  {item.title}
                </h3>

                <p className="text-sm text-zuimi-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-linear-to-b to-[#000000] from-[#101727] py-16 px-6">
        <JoinWaitlistCard />
      </div>
    </section>
  );
};
