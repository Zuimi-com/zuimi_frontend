import Image from "next/image";
import React from "react";

const JoinWaitlist: React.FC = () => {
  return (
    <section className="w-full bg-black text-white py-20 px-6 relative min-h-165" id="contact">
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
        <form className="space-y-5">
          {/* Name row */}
          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="First Name"
              className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-pink-500 transition"
            />

            <input
              type="text"
              placeholder="Last Name"
              className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-pink-500 transition"
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 via-pink-500 to-orange-400 hover:opacity-90 transition"
          >
            Join the Waitlist →
          </button>
        </form>

        {/* Footer text */}
        <p className="text-gray-500 text-sm mt-6">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

export default JoinWaitlist;
