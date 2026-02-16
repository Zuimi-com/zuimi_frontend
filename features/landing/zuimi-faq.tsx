"use client"
import React, { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "What is Zuimi?",
    answer:
      "Zuimi is a streaming and media platform dedicated to showcasing African cinema, connecting creators with audiences, and preserving authentic cultural storytelling.",
  },
  {
    question: "Who is Zuimi for?",
    answer:
      "Zuimi is for film lovers, storytellers, producers, and anyone passionate about discovering authentic African stories and supporting local creators.",
  },
  {
    question: "Is Zuimi only for African audiences?",
    answer:
      "No. Zuimi is built for both local and global audiences who want access to rich, diverse, and culturally honest African films.",
  },
  {
    question: "Can filmmakers submit their films?",
    answer:
      "Yes. Zuimi provides opportunities for filmmakers to showcase their work and reach new audiences through our platform.",
  },
  {
    question: "Is Zuimi free to use?",
    answer:
      "Zuimi offers different access tiers. Some content may be free, while premium films and features may require a subscription.",
  },
  {
    question: "How do I stay updated?",
    answer:
      "You can join the waitlist or subscribe to updates to receive news about launches, new films, and exclusive platform features.",
  },
];

const ZuimiFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-800 rounded-xl overflow-hidden transition"
              >
                {/* Question */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5 hover:bg-white/5 transition cursor-pointer"
                >
                  <span className="font-medium text-lg">{item.question}</span>

                  {/* Icon */}
                  <span className="text-2xl font-light">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-gray-400 leading-relaxed">
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
