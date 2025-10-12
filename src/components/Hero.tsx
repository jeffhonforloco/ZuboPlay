import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { Play } from "lucide-react";
import zuboIcon from "@/assets/zubo-icon.jpg";
export const Hero = () => {
  const navigate = useNavigate();
  return <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/80 to-accent/20 py-8 md:py-20 px-4 md:px-6 min-h-screen flex flex-col justify-center">
      {/* User Menu */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 z-10">
        <UserMenu />
      </div>
      
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-4 md:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-tight">
              ZuboPlay:<br />
              <span className="text-primary">Rhythm Realms</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 font-medium text-responsive">
              Design your own bouncy Zubo and jump through musical worlds!
            </p>
            <p className="text-base md:text-lg text-foreground/70 text-responsive">
              Every creation changes the game. Infinite adventures await.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start pt-2 md:pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-[0_8px_32px_hsl(var(--primary)/0.3)] hover:scale-105 transition-transform touch-target mobile-bounce" 
                onClick={() => navigate("/game")}
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 font-bold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full hover:scale-105 transition-transform touch-target mobile-bounce" 
                onClick={() => document.getElementById('creator')?.scrollIntoView({
                  behavior: 'smooth'
                })}
              >
                Create Your Zubo
              </Button>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => <div key={i} className="w-12 h-12 rounded-full bg-primary border-4 border-background animate-pulse" style={{
                zIndex: 3 - i,
                animationDelay: `${i * 0.2}s`
              }} />)}
              </div>
              <p className="text-sm font-medium text-foreground/70">
                Join <span className="font-bold text-primary">1,000+</span> players creating Zubos
              </p>
            </div>
          </div>

          {/* Zubo Icon */}
          <div className="flex justify-center items-center order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl animate-pulse-glow" />
              <img 
                src={zuboIcon} 
                alt="Purple Zubo Character" 
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain animate-float drop-shadow-2xl high-dpi" 
              />
              {/* Sound waves */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
                {[...Array(5)].map((_, i) => <div key={i} className="w-1 md:w-2 h-8 md:h-12 bg-accent rounded-full animate-pulse" style={{
                animationDelay: `${i * 0.1}s`,
                height: `${(i % 2 === 0 ? 2 : 1.5) * 16}px`
              }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-bounce-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-float" />
    </section>;
};