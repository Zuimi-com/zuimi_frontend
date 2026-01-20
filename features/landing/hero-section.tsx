"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <Image
          src="/background.svg"
          alt="Zuimi background image"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 -translate-x-1/2 top-10 z-10"
      >
        <Image
          src="/zuimi-logo.svg"
          alt="Zuimi logo"
          width={200}
          height={100}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl px-6 lg:px-0 text-center flex flex-col items-center gap-6"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 rounded-full bg-[#313e6b] border px-4 py-1.5"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2.5 h-2.5 rounded-full bg-green-500"
          />
          <span className="text-sm font-medium text-white">Coming Soon</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-[32px] md:text-[40px] font-bold text-white leading-tight max-w-123"
        >
          Your Next Favorite Movie Is Just One Click Away
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-white text-[20px] md:text-[24px] max-w-205.75"
        >
          Zuimi is building the future of African cinema. A streaming platform
          with local roots and global ambition that celebrates our stories,
          rewards our filmmakers, and delivers the ultimate film experience.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex w-full max-w-md flex-col sm:flex-row gap-3 mt-4 items-center"
        >
          <Input
            placeholder="Enter your email"
            className="bg-[#313e6b] text-white placeholder:text-white h-16 placeholder:text-[20px]"
          />

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button className="flex items-center gap-2 bg-zuimi-blue h-12 w-full hover:bg-zuimi-blue text-base">
              Join Waitlist
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-base text-neutral-300 mt-2"
        >
          🎬 Join the movement to strengthen African cinema
        </motion.p>
      </motion.div>
    </section>
  );
};
