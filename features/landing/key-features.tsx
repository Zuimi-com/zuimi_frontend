"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
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

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const KeyFeatures: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col">
      <div className="w-full bg-linear-to-b from-[#000000] to-[#101727] py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-3xl space-y-8 mx-auto"
          >
            <h1 className="font-bold text-white text-center text-pretty text-[32px] md:text-[40px]">
              Everything You Need for the Perfect Streaming Experience
            </h1>
            <p className="text-white text-2xl text-center">
              We are building the ultimate platform for movie enthusiasts with
              features designed to enhance your viewing experience.
            </p>
          </motion.div>

          {/* Features Grid (POP UP ON SCROLL) */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-10 md:mt-20"
          >
            {data.map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -6 }}
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="bg-linear-to-b to-[#000000] from-[#101727] py-16 px-6"
      >
        <JoinWaitlistCard />
      </motion.div>
    </section>
  );
};
