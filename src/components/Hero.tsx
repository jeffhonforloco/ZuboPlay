import { Button } from "@/components/ui/button";
import zuboIcon from "@/assets/zubo-icon.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/80 to-accent/20 py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black text-foreground leading-tight">
              ZuboPlay:<br />
              <span className="text-primary">Rhythm Realms</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 font-medium">
              Design your own bouncy Zubo and jump through musical worlds!
            </p>
            <p className="text-lg text-foreground/70">
              Every creation changes the game. Infinite adventures await.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_8px_32px_hsl(var(--primary)/0.3)] hover:scale-105 transition-transform"
              >
                Create Your Zubo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-foreground/20 bg-background/50 backdrop-blur-sm hover:bg-background/80 font-bold text-lg px-8 py-6 rounded-full"
              >
                Watch Trailer
              </Button>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-12 h-12 rounded-full bg-primary border-4 border-background"
                    style={{ zIndex: 3 - i }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-foreground/70">
                Join <span className="text-primary font-bold">10,000+</span> players creating Zubos
              </p>
            </div>
          </div>

          {/* Zubo Icon */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl animate-pulse-glow" />
              <img 
                src={zuboIcon} 
                alt="Purple Zubo Character" 
                className="relative w-80 h-80 md:w-96 md:h-96 object-contain animate-float drop-shadow-2xl"
              />
              {/* Sound waves */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-12 bg-accent rounded-full animate-pulse"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      height: `${(i % 2 === 0 ? 3 : 2) * 16}px`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-bounce-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-float" />
    </section>
  );
};
