import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
      <div className="container mx-auto max-w-4xl ultra-wide">
        <Card className="p-6 md:p-12 text-center bg-background/80 backdrop-blur-sm border-2 border-primary/30 shadow-[0_8px_32px_hsl(var(--primary)/0.3)]">
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-accent animate-pulse" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 text-responsive">
            Ready to Jump In?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 text-responsive">
            Join thousands of players creating unique Zubos and mastering rhythm-based challenges. 
            Your musical adventure starts now!
          </p>
          
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-[0_8px_32px_hsl(var(--primary)/0.3)] hover:scale-105 transition-transform touch-target mobile-bounce"
            onClick={() => navigate("/game")}
          >
            Start Playing Free
          </Button>

          <div className="text-xs md:text-sm text-muted-foreground mt-4 md:mt-6 text-responsive">
            No download required • Play in your browser
          </div>
        </Card>
      </div>
    </section>
  );
};
