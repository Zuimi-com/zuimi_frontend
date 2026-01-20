import { Footer } from "@/features/landing/footer";
import { HeroSection } from "@/features/landing/hero-section";
import { KeyFeatures } from "@/features/landing/key-features";

export default function Home() {
  return (
    <main className="">
      <HeroSection />
      <KeyFeatures />
      <Footer />
    </main>
  );
}
