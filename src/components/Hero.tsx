import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { Play, Sparkles, Star, Zap, Heart } from "lucide-react";
import zuboIcon from "@/assets/zubo-icon.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 min-h-screen flex flex-col justify-center">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* User Menu */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 z-20">
        <UserMenu />
      </div>
      
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Premium Title with Glow Effect */}
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  ZuboPlay
                </span>
                <br />
                <span className="text-white drop-shadow-2xl">
                  Melody Makers
                </span>
              </h1>
              {/* Glow effect */}
              <div className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white/20 blur-sm">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  ZuboPlay
                </span>
                <br />
                <span className="text-white/20">
                  Melody Makers
                </span>
              </div>
            </div>

            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-medium">
              Design your own bouncy Zubo and jump through musical worlds!
            </p>
            <p className="text-lg md:text-xl text-white/70">
              Every creation changes the game. Infinite adventures await.
            </p>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start pt-4">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg md:text-xl px-8 md:px-10 py-6 md:py-8 rounded-2xl shadow-[0_20px_40px_rgba(168,85,247,0.4)] hover:shadow-[0_25px_50px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 touch-target mobile-bounce border-2 border-white/20" 
                onClick={() => navigate("/game")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <Play className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">Play Level</span>
                <Sparkles className="w-5 h-5 ml-2 relative z-10 animate-pulse" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-2 border-white/30 hover:border-white/50 font-bold text-lg md:text-xl px-8 md:px-10 py-6 md:py-8 rounded-2xl hover:scale-105 transition-all duration-300 touch-target mobile-bounce bg-white/10 backdrop-blur-sm hover:bg-white/20" 
                onClick={() => document.getElementById('creator')?.scrollIntoView({
                  behavior: 'smooth'
                })}
              >
                <Star className="w-6 h-6 mr-3" />
                <span>ZuboLab</span>
              </Button>
            </div>

            {/* Premium Stats */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-6">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-white shadow-lg animate-pulse" 
                    style={{
                      zIndex: 5 - i,
                      animationDelay: `${i * 0.2}s`
                    }} 
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">
                  Join <span className="text-yellow-300">10,000+</span> players
                </p>
                <p className="text-white/70 text-sm">
                  Creating amazing Zubos daily
                </p>
              </div>
            </div>
          </div>

          {/* Premium Zubo Character */}
          <div className="flex justify-center items-center order-1 lg:order-2">
            <div className="relative">
              {/* Multiple Glow Layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse-glow scale-150" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse-glow scale-125" />
              
              {/* Main Character Container */}
              <div className="relative z-10">
                <img 
                  src={zuboIcon} 
                  alt="Purple Zubo Character" 
                  className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] object-contain animate-float drop-shadow-2xl" 
                />
                
                {/* Floating Icons Around Character */}
                <div className="absolute top-8 left-8 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-16 right-12 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}>
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-20 left-12 w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '1s' }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Enhanced Sound Waves */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 md:w-3 h-12 md:h-16 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg" 
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

      {/* Premium Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-bounce-slow" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-float" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-500/20 to-yellow-500/20 rounded-full blur-xl animate-pulse" />
    </section>
  );
};