import Image from "next/image";
import Link from "next/link";
import React from "react";
import xIcon from "@/public/X.svg";
import instagramIcon from "@/public/Instagram.svg";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "#features", label: "Features" },
];

const socialLinks = [
  { icon: xIcon, label: "X", href: "#" },
  // { icon: "/Facebook.svg", label: "Facebook", href: "#" },
  { icon: instagramIcon, label: "Instagram", href: "#" },
];

export const Footer = () => {
  return (
    <footer className="bg-black px-6 py-10 ">
      <div className="relative py-10 md:mx-[39.5px]">
        <div className="block absolute z-100 bottom-0 h-1  gradient w-full left-0 right-0" />
        <div className="absolute z-100 top-0 h-1  gradient w-full left-0 right-0" />
        <div className="max-w-7xl mx-auto flex flex-col gap-8 md:flex-row items-center justify-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/zuimi-logo.svg"
              alt="Zuimi logo"
              width={160}
              height={60}
              className="object-contain"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base md:text-lg font-medium group text-white"
              >
                <span className="transition group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:via-pink-500 group-hover:to-orange-400 group-hover:bg-clip-text group-hover:text-transparent duration-300">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 flex items-center justify-center rounded-full transition"
              >
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={40}
                  height={40}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-8 text-center text-[8px] md:text-[16px] text-white">
        <span className="md:hidden">
          © 2026 Zuimi. All rights reserved.
          <br />
          Strengthening African cinema, one story at a time.
        </span>
        <span className="hidden md:inline">
          © 2026 Zuimi. All rights reserved. Strengthening African cinema, one
          story at a time.
        </span>
      </div>
    </footer>
  );
};
