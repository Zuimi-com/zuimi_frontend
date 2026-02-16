import Image from "next/image";
import Link from "next/link";
import React from "react";

const navLinks = [
  { href: "/", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "#features", label: "Features" },
];

const socialLinks = [
  { icon: "/X.svg", label: "X", href: "#" },
  { icon: "/Facebook.svg", label: "Facebook", href: "#" },
  { icon: "/Instagram.svg", label: "Instagram", href: "#" },
];

export const Footer = () => {
  return (
    <footer className="border-y mb-5 border-neutral-200 px-6 py-10 bg-black">
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
              className="text-base md:text-lg font-medium text-white"
            >
              {link.label}
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
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black transition"
            >
              <Image
                src={social.icon}
                alt={social.label}
                width={25}
                height={25}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-8 text-center text-sm text-white">
        © 2026 Zuimi. All rights reserved. Strengthening African cinema, one
        story at a time.
      </div>
    </footer>
  );
};
