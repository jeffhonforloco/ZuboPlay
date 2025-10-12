import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shuffle, Save, Check, Star, Zap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

const bodyColors = [
  { name: "Purple", value: "#8B5CF6", gradient: "from-purple-500 to-purple-700" },
  { name: "Cyan", value: "#06B6D4", gradient: "from-cyan-500 to-cyan-700" },
  { name: "Pink", value: "#EC4899", gradient: "from-pink-500 to-pink-700" },
  { name: "Green", value: "#10B981", gradient: "from-green-500 to-green-700" },
  { name: "Orange", value: "#F59E0B", gradient: "from-orange-500 to-orange-700" },
  { name: "Blue", value: "#3B82F6", gradient: "from-blue-500 to-blue-700" },
  { name: "Red", value: "#EF4444", gradient: "from-red-500 to-red-700" },
  { name: "Yellow", value: "#EAB308", gradient: "from-yellow-500 to-yellow-700" },
  { name: "Indigo", value: "#6366F1", gradient: "from-indigo-500 to-indigo-700" },
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
      ? "rounded-2xl" 
      : "rounded-full scale-y-150";
    
    const legHeight = legType === "springy" ? "h-20" : "h-10";
    
    // Debug: Log current color
    console.log("Current color:", color);

    return (
      <div key={`${bodyType}-${legType}-${color}`} className="flex flex-col items-center justify-end h-64 relative">
        {/* Premium Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl scale-150" />
        
        {/* Body with Premium Effects */}
        <div 
          className={`relative w-32 h-32 ${bodyClass} shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 animate-bounce-slow border-4 border-white/20`}
          style={{ 
            backgroundColor: color,
            boxShadow: `0 20px 60px ${color}40, inset 0 2px 4px rgba(255,255,255,0.3)`
          }}
        >
          {/* Premium Eyes with Glow */}
          <div className="flex gap-4 justify-center pt-8">
            <div className="relative w-6 h-6 bg-white rounded-full shadow-lg">
              <div className="absolute inset-1 bg-black rounded-full" />
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-white/30 rounded-full blur-sm" />
            </div>
            <div className="relative w-6 h-6 bg-white rounded-full shadow-lg">
              <div className="absolute inset-1 bg-black rounded-full" />
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-white/30 rounded-full blur-sm" />
            </div>
          </div>
          
          {/* Premium Mouth */}
          <div className="w-8 h-4 bg-white rounded-full mx-auto mt-3 shadow-inner relative">
            <div className="absolute inset-1 bg-black/20 rounded-full" />
          </div>
          
          {/* Floating Particles */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
        
        {/* Premium Legs */}
        <div className="flex gap-4 -mt-2">
          <div 
            className={`w-6 ${legHeight} bg-gradient-to-t from-gray-700 to-gray-500 rounded-full transition-all duration-500 shadow-lg border-2 border-white/20`}
          />
          <div 
            className={`w-6 ${legHeight} bg-gradient-to-t from-gray-700 to-gray-500 rounded-full transition-all duration-500 shadow-lg border-2 border-white/20`}
          />
        </div>
        
        {/* Ground Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/20 rounded-full blur-lg" />
      </div>
    );
  };

  return (
    <section id="creator" className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-300/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-xl animate-bounce-slow" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              ZuboLab
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto">
            Design your perfect Zubo with premium customization options
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Premium Preview Card */}
          <Card className="relative p-8 md:p-12 bg-white/80 backdrop-blur-sm border-0 shadow-[0_25px_50px_rgba(0,0,0,0.1)] rounded-3xl order-2 lg:order-1">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Live Preview
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
              
              {renderZuboPreview()}
              
              {/* Integrated Color Picker */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Choose Color</h4>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {bodyColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        console.log("Color clicked:", c.name, c.value);
                        setColor(c.value);
                      }}
                      className={`group relative w-full aspect-square rounded-xl border-2 transition-all duration-300 touch-target mobile-bounce ${
                        color === c.value
                          ? "border-gray-800 scale-110 shadow-lg"
                          : "border-gray-200 hover:scale-105 hover:shadow-md"
                      }`}
                      style={{ 
                        backgroundColor: c.value,
                        boxShadow: color === c.value ? `0 4px 15px ${c.value}40` : undefined
                      }}
                      title={c.name}
                      aria-label={`Select ${c.name} color`}
                    >
                      {color === c.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-gray-800" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Premium Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  className="group relative flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300 touch-target mobile-bounce"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <Save className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10">
                    {isSaving ? "Saving..." : "Save Zubo"}
                  </span>
                  {!isSaving && <Check className="w-5 h-5 ml-2 relative z-10" />}
                </Button>
                
                <Button 
                  variant="outline"
                  className="group border-2 border-purple-300 hover:border-purple-400 font-bold text-lg py-6 px-8 rounded-2xl hover:scale-105 transition-all duration-300 touch-target mobile-bounce bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  onClick={handleRandomize}
                >
                  <Shuffle className="w-5 h-5 mr-3" />
                  <span>Random Zubo</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Premium Controls */}
          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
            {/* Body Type */}
            <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-[0_15px_35px_rgba(0,0,0,0.08)] rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-800">Body Type</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(["sphere", "cube", "tube"] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 touch-target mobile-bounce ${
                      bodyType === type
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105 shadow-lg"
                        : "border-gray-200 hover:border-purple-300 hover:scale-105 bg-white"
                    }`}
                  >
                    <div className="text-center">
                      {/* Visual Preview of Body Type */}
                      <div className="flex justify-center mb-3">
                        <div 
                          className={`w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 ${
                            type === "sphere" 
                              ? "rounded-full" 
                              : type === "cube" 
                              ? "rounded-2xl" 
                              : "rounded-full scale-y-150"
                          }`}
                        />
                      </div>
                      <div className="text-lg font-bold capitalize text-gray-800 mb-2">{type}</div>
                      <div className="text-sm text-gray-500">
                        {type === "sphere" && "Balanced and bouncy"}
                        {type === "cube" && "Stable and sturdy"}
                        {type === "tube" && "Reaches higher"}
                      </div>
                    </div>
                    {bodyType === type && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Leg Type */}
            <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-[0_15px_35px_rgba(0,0,0,0.08)] rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-800">Leg Type</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(["springy", "short"] as LegType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLegType(type)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 touch-target mobile-bounce ${
                      legType === type
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 scale-105 shadow-lg"
                        : "border-gray-200 hover:border-blue-300 hover:scale-105 bg-white"
                    }`}
                  >
                    <div className="text-center">
                      {/* Visual Preview of Leg Type */}
                      <div className="flex justify-center mb-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-1" />
                          <div className="flex gap-1">
                            <div 
                              className={`w-2 bg-gradient-to-t from-gray-600 to-gray-400 rounded-full ${
                                type === "springy" ? "h-8" : "h-4"
                              }`}
                            />
                            <div 
                              className={`w-2 bg-gradient-to-t from-gray-600 to-gray-400 rounded-full ${
                                type === "springy" ? "h-8" : "h-4"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold capitalize text-gray-800 mb-2">
                        {type === "springy" ? "Springy Legs" : "Heavy Legs"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {type === "springy" ? "Jump 50% higher!" : "Falls faster, more control"}
                      </div>
                    </div>
                    {legType === type && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
};

