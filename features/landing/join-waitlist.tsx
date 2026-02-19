"use client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useSubcribeToWaitlist } from "../dashboard/service/subscribers";
import toast from "react-hot-toast";

const JoinWaitlist: React.FC = () => {
  const subscribe = useSubcribeToWaitlist();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      await subscribe.mutateAsync({
        email: form.email,
        last_name: form.lastName,
        first_name: form.firstName,
      });

      toast.success("Successfully joined waitlist 🎉");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
      });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <section
      className="w-full bg-[#141414] text-white py-20 px-6 relative min-h-165"
      id="contact"
    >
      <Image
        src="/deco1.png"
        alt="Zuimi background image"
        width={100}
        height={100}
        className="object-cover absolute right-0 bottom-0 w-76 h-76 hidden lg:block"
      />
      <Image
        src="/deco2.png"
        alt="Zuimi background image"
        width={100}
        height={100}
        className="object-cover absolute left-0 top-0 w-76 h-76 hidden lg:block"
      />
      <div className="max-w-3xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Be a part of our Story
        </h2>

        {/* Subtitle */}
        <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed">
          Be part of the our story as we work to strengthen African cinema.
          <br />
          Sign up to get exclusive access and updates on Zuimi
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-5">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              placeholder="First Name"
              className="w-full bg-transparent border border-gray-600 px-4 py-3 outline-none focus:border-pink-500 transition"
              required
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              placeholder="Last Name"
              className="w-full bg-transparent border border-gray-600 px-4 py-3 outline-none focus:border-pink-500 transition"
              required
            />
          </div>

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email address"
            className="w-full bg-transparent border border-gray-600 px-4 py-3 outline-none focus:border-pink-500 transition"
            required
          />

          <button
            type="submit"
            disabled={subscribe.isPending}
            className="w-full rounded-xl font-semibold text-lg bg-gradient-to-r flex justify-center py-6 items-center group from-blue-500 lg:text-2xl via-pink-500 to-orange-400 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {subscribe.isPending ? "Joining..." : "Join the Waitlist"}

            <ChevronRight className="group-hover:translate-x-1 duration-300 transition-transform size-6" />
          </button>
        </form>

        {/* Footer text */}
        <p className="text-white text-sm mt-6">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

export default JoinWaitlist;
