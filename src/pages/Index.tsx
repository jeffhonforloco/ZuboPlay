import { Hero } from "@/components/Hero";
import { ZuboCreator } from "@/components/ZuboCreator";
import { RhythmDemo } from "@/components/RhythmDemo";
import { Features } from "@/components/Features";
import { CallToAction } from "@/components/CallToAction";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <ZuboCreator />
      <RhythmDemo />
      <CallToAction />
    </main>
  );
};

export default Index;
