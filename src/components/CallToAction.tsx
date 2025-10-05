import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-12 text-center bg-background/80 backdrop-blur-sm border-2 border-primary/30 shadow-[0_8px_32px_hsl(var(--primary)/0.3)]">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-accent animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Ready to Jump In?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players creating unique Zubos and mastering rhythm-based challenges. 
            Your musical adventure starts now!
          </p>
          
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_8px_32px_hsl(var(--primary)/0.3)] hover:scale-105 transition-transform"
            onClick={() => navigate("/game")}
          >
            Start Playing Free
          </Button>

          <div className="text-sm text-muted-foreground mt-6">
            No download required • Play in your browser
          </div>
        </Card>
      </div>
    </section>
  );
};
