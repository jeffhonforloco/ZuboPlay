import { Hero } from "@/components/Hero";
import { ZuboCreator } from "@/components/ZuboCreator";
import { RhythmDemo } from "@/components/RhythmDemo";
import { Features } from "@/components/Features";
import { CallToAction } from "@/components/CallToAction";
import MobileNavigation from "@/components/MobileNavigation";

const Index = () => {
  return (
    <main className="min-h-screen">
      <MobileNavigation />
      <Hero />
      <Features />
      <ZuboCreator />
      <RhythmDemo />
      <CallToAction />
    </main>
  );
};

export default Index;
