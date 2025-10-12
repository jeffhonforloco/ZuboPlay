import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Star, Zap, Heart, Crown, Gift, Users, Trophy } from "lucide-react";
import { GuestSystem } from "@/lib/guestSystem";

interface SignupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
  remainingPlays: number;
}

export const SignupPrompt = ({ isOpen, onClose, onSignup, remainingPlays }: SignupPromptProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignup = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onSignup();
      navigate("/auth");
    }, 300);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`relative w-full max-w-md bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-0 shadow-[0_25px_50px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Premium Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-t-3xl" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Join ZuboPlay!
              </h2>
            </div>
            
            <p className="text-gray-600 font-medium mb-2">
              {remainingPlays > 0 
                ? `You have ${remainingPlays} free play${remainingPlays === 1 ? '' : 's'} left`
                : "You've used all your free plays"
              }
            </p>
            
            <p className="text-sm text-gray-500">
              Sign up to continue playing and unlock premium features!
            </p>
          </div>
        </div>

        {/* Premium Benefits */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Unlimited Plays</div>
                <div className="text-xs text-gray-500">Play anytime</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Save Progress</div>
                <div className="text-xs text-gray-500">Never lose data</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Daily Rewards</div>
                <div className="text-xs text-gray-500">Free coins daily</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Leaderboards</div>
                <div className="text-xs text-gray-500">Compete globally</div>
              </div>
            </div>
          </div>

          {/* Premium Stats */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">10,000+</div>
                <div className="text-xs text-gray-500">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">50+</div>
                <div className="text-xs text-gray-500">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.8★</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSignup}
              className="w-full group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300 touch-target mobile-bounce"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <Users className="w-5 h-5 mr-3 relative z-10" />
              <span className="relative z-10">Sign Up Free</span>
              <Heart className="w-5 h-5 ml-2 relative z-10 animate-pulse" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-2 border-gray-300 hover:border-gray-400 font-bold text-lg py-4 rounded-2xl hover:scale-105 transition-all duration-300 touch-target mobile-bounce bg-white/50 backdrop-blur-sm hover:bg-white/80"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
