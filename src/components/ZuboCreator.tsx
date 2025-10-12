import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

const bodyColors = [
  { name: "Purple", value: "hsl(280, 75%, 60%)" },
  { name: "Cyan", value: "hsl(190, 95%, 45%)" },
  { name: "Pink", value: "hsl(330, 75%, 60%)" },
  { name: "Green", value: "hsl(150, 70%, 50%)" },
  { name: "Orange", value: "hsl(35, 95%, 60%)" },
];

export const ZuboCreator = () => {
  const [bodyType, setBodyType] = useState<BodyType>("sphere");
  const [legType, setLegType] = useState<LegType>("springy");
  const [color, setColor] = useState(bodyColors[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your Zubo design",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);
    try {
      const zuboDesign = { bodyType, legType, color };
      
      const { error } = await supabase
        .from("profiles")
        .update({ favorite_zubo_design: zuboDesign })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Zubo saved!",
        description: "Your unique Zubo design has been saved to your profile",
      });
    } catch (error) {
      console.error("Error saving Zubo:", error);
      toast({
        title: "Save failed",
        description: "Failed to save your Zubo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomize = () => {
    const randomBody = (["sphere", "cube", "tube"] as BodyType[])[Math.floor(Math.random() * 3)];
    const randomLeg = (["springy", "short"] as LegType[])[Math.floor(Math.random() * 2)];
    const randomColor = bodyColors[Math.floor(Math.random() * bodyColors.length)].value;
    
    setBodyType(randomBody);
    setLegType(randomLeg);
    setColor(randomColor);
    
    toast({
      title: "Random Zubo generated!",
      description: "Here's a unique random design for you",
    });
  };

  const renderZuboPreview = () => {
    const bodyClass = bodyType === "sphere" 
      ? "rounded-full" 
      : bodyType === "cube" 
      ? "rounded-lg" 
      : "rounded-full scale-y-125";
    
    const legHeight = legType === "springy" ? "h-16" : "h-8";

    return (
      <div className="flex flex-col items-center justify-end h-64 relative">
        {/* Body */}
        <div 
          className={`w-32 h-32 ${bodyClass} shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 animate-bounce-slow`}
          style={{ backgroundColor: color }}
        >
          {/* Eyes */}
          <div className="flex gap-4 justify-center pt-10">
            <div className="w-6 h-6 bg-foreground rounded-full">
              <div className="w-3 h-3 bg-background rounded-full ml-1 mt-1" />
            </div>
            <div className="w-6 h-6 bg-foreground rounded-full">
              <div className="w-3 h-3 bg-background rounded-full ml-1 mt-1" />
            </div>
          </div>
          {/* Mouth */}
          <div className="w-8 h-4 bg-foreground rounded-full mx-auto mt-2" />
        </div>
        
        {/* Legs */}
        <div className="flex gap-4 -mt-2">
          <div 
            className={`w-6 ${legHeight} bg-foreground/80 rounded-full transition-all duration-300`}
          />
          <div 
            className={`w-6 ${legHeight} bg-foreground/80 rounded-full transition-all duration-300`}
          />
        </div>
      </div>
    );
  };

  return (
    <section id="creator" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl ultra-wide">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 text-responsive">
            Build Your Zubo
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-responsive">
            Mix and match parts to create your unique bouncy friend
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 tablet-grid">
          {/* Preview */}
          <Card className="p-4 md:p-8 bg-gradient-to-br from-secondary/20 to-accent/10 border-2 order-2 lg:order-1">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-responsive">Preview</h3>
            {renderZuboPreview()}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 font-bold rounded-full touch-target mobile-bounce"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Zubo"}
              </Button>
              <Button 
                variant="outline"
                className="border-2 rounded-full touch-target mobile-bounce"
                onClick={handleRandomize}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AI Random</span>
                <span className="sm:hidden">Random</span>
              </Button>
            </div>
          </Card>

          {/* Controls */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            {/* Body Type */}
            <Card className="p-4 md:p-6">
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-responsive">Body Shape</h4>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {(["sphere", "cube", "tube"] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all touch-target mobile-bounce ${
                      bodyType === type
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs md:text-sm font-medium capitalize text-responsive">{type}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Leg Type */}
            <Card className="p-4 md:p-6">
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-responsive">Legs</h4>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {(["springy", "short"] as LegType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLegType(type)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all touch-target mobile-bounce ${
                      legType === type
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs md:text-sm font-medium capitalize text-responsive">
                      {type} {type === "springy" ? "🦘" : "🐾"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-responsive">
                      {type === "springy" ? "High Jump" : "Fast Speed"}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Color Picker */}
            <Card className="p-4 md:p-6">
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-responsive">Color</h4>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {bodyColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 transition-all touch-target mobile-bounce ${
                      color === c.value
                        ? "border-foreground scale-110"
                        : "border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    aria-label={`Select ${c.name} color`}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
