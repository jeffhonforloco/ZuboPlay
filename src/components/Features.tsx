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
    <section className="py-20 px-6 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Why ZuboPlay?
          </h2>
          <p className="text-xl text-muted-foreground">
            The only rhythm game where YOU design the star
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 border-2 hover:border-primary/50 transition-all hover:scale-105 hover:shadow-[0_8px_32px_hsl(var(--primary)/0.2)] bg-card"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-muted ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
