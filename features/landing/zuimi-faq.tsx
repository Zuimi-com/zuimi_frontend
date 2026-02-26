"use client";
import { Plus } from "lucide-react";
import React, { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "What is Zuimi?",
    answer:
      "Zuimi is your home for African movies a streaming platform that brings together curated films from Nollywood and Across the continent, all in one place.",
  },
  {
    question: "Can I Watch offline?",
    answer:
      "Yes! Download your favorite movies and watch them whenever you want, even without internet",
  },
  {
    question: "Does Zuimi use a subscription model?",
    answer:
      "No, Zuimi uses a pay-on-demand model, putting you in control of your watch time.Pay only for films you want when you want.",
  },
  {
    question: "How does Zuimi protect movies from piracy",
    answer:
      "Our platform uses secure streaming technology that ensures movies are protected, keeping both creators and viewers safe.",
  },
  {
    question: "Does Zuimi only feature Nollywood films?",
    answer:
      "No, While we celebrate Nollywood, We also feature movie from across Africa to give you a rich and diverse viewing experience.",
  },
];

const ZuimiFAQ: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndexes(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // close if open
          : [...prev, index], // open if closed
    );
  };

  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-[20px] md:text-[40px] font-bold mb-4 md:mb-12">
          Frequently Asked Questions
        </h2>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndexes.includes(index);

            return (
              <div
                key={index}
                className=" border-gray-800 rounded-md overflow-hidden transition"
              >
                {/* Question */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5  transition cursor-pointer bg-[#2D2D2D] overflow-hidden h-full"
                >
                  <span className="font-normal text-lg lg:text-[24px]">
                    {item.question}
                  </span>

                  <Plus
                    className={`transition-transform duration-300 w-[30px] h-[30px] shrink-0 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all bg-[#2D2D2D] duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-0.5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 py-6 text-white leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ZuimiFAQ;
