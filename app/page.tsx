import { Footer } from "@/features/landing/footer";
import { HeroSection } from "@/features/landing/hero-section";
import JoinWaitlist from "@/features/landing/join-waitlist";
import { KeyFeatures } from "@/features/landing/key-features";
import { MoreStreaming } from "@/features/landing/more-streaming";
import { WhyZuimiExist } from "@/features/landing/whyZuimiExist";
import { ZuimiDifference } from "@/features/landing/zuimi-difference";
import ZuimiFAQ from "@/features/landing/zuimi-faq";

export default function Home() {
  return (
    <main className="">
      <HeroSection />
      <KeyFeatures />
      <WhyZuimiExist />
      <ZuimiDifference />
      <MoreStreaming />
      <JoinWaitlist />
      <ZuimiFAQ />
      <Footer />
    </main>
  );
}
