import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Apple, Play } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-12 text-center bg-background/80 backdrop-blur-sm border-2 border-primary/30 shadow-[0_8px_32px_hsl(var(--primary)/0.3)]">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Ready to Create Your Zubo?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players designing unique characters and conquering rhythm challenges!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-foreground hover:bg-foreground/90 text-background font-bold text-lg px-8 py-6 rounded-full"
            >
              <Apple className="w-6 h-6 mr-2" />
              Download on iOS
            </Button>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full"
            >
              <Play className="w-6 h-6 mr-2" />
              Get it on Android
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Coming Soon • Pre-register for exclusive launch rewards
          </div>
        </Card>
      </div>
    </section>
  );
};
