import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Palette, Music } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Endless Customization",
    description: "Mix bodies, legs, arms, and hats. Every part changes how your Zubo plays!",
    color: "text-primary",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Adventures",
    description: "Levels adapt to your Zubo's abilities and your skill level automatically.",
    color: "text-accent",
  },
  {
    icon: Music,
    title: "Rhythm-Based Gameplay",
    description: "Jump, hover, and bounce to the beat in procedurally generated musical worlds.",
    color: "text-secondary",
  },
  {
    icon: Zap,
    title: "Physics That Matter",
    description: "Springy legs jump higher, heavy bodies fall faster. Your design = your strategy!",
    color: "text-primary",
  },
];

export const Features = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/20">
      <div className="container mx-auto max-w-6xl ultra-wide">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 text-responsive">
            Why ZuboPlay?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-responsive">
            The only rhythm game where YOU design the star
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 tablet-grid desktop-grid">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-4 md:p-8 border-2 hover:border-primary/50 transition-all hover:scale-105 hover:shadow-[0_8px_32px_hsl(var(--primary)/0.2)] bg-card mobile-bounce"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`p-2 md:p-3 rounded-xl bg-muted ${feature.color} touch-target`}>
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-2xl font-bold mb-2 text-responsive">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground text-responsive">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
