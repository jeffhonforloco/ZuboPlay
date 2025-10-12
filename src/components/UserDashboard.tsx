import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Zap, 
  Heart, 
  Crown, 
  Gift, 
  Users, 
  Target,
  Clock,
  Coins,
  Award,
  Sparkles
} from "lucide-react";
import { UserProgression } from "@/lib/userProgression";
import { useAuth } from "@/hooks/useAuth";

export const UserDashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [dailyRewards, setDailyRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const stats = await UserProgression.getUserStats(user.id);
        const rewards = await UserProgression.getDailyRewards(user.id);
        
        setUserStats(stats);
        setDailyRewards(rewards);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Your Progress
        </h2>
        <p className="text-gray-600">Track your achievements and unlock new features</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{userStats.totalScore.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Score</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{Math.floor(userStats.playTime / 60)}m</div>
          <div className="text-sm text-gray-600">Play Time</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-yellow-50">
          <Coins className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">{userStats.coins}</div>
          <div className="text-sm text-gray-600">Coins</div>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
          <Badge variant="secondary" className="ml-auto">
            {userStats.achievements} unlocked
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <Star className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-800">First Jump</div>
              <div className="text-sm text-gray-500">Make your first jump</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <Trophy className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-800">Level Master</div>
              <div className="text-sm text-gray-500">Reach level 5</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <Zap className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-800">Power Player</div>
              <div className="text-sm text-gray-500">Use 10 power-ups</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
            <Heart className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-medium text-gray-800">Coin Collector</div>
              <div className="text-sm text-gray-500">Collect 100 coins</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Rewards */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-800">Daily Rewards</h3>
          <Badge variant="secondary" className="ml-auto">
            {userStats.dailyRewards} claimed
          </Badge>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl flex items-center justify-center ${
                i < userStats.dailyRewards
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                  : i === userStats.dailyRewards
                  ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < userStats.dailyRewards ? (
                <Crown className="w-4 h-4" />
              ) : i === userStats.dailyRewards ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Gift className="w-4 h-4 mr-2" />
            Claim Today's Reward
          </Button>
        </div>
      </Card>

      {/* Unlocked Features */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-800">Unlocked Features</h3>
          <Badge variant="secondary" className="ml-auto">
            {userStats.unlockedFeatures} available
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Double Jump</div>
              <div className="text-sm text-gray-500">Jump twice in mid-air</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Obstacle Destruction</div>
              <div className="text-sm text-gray-500">Destroy obstacles with power</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress to Next Level */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-800">Progress to Next Level</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Level {userStats.level} → {userStats.level + 1}</span>
            <span className="text-sm text-gray-500">
              {userStats.totalScore.toLocaleString()} / {((userStats.level + 1) * 500).toLocaleString()} points
            </span>
          </div>
          
          <Progress 
            value={(userStats.totalScore / ((userStats.level + 1) * 500)) * 100} 
            className="h-3"
          />
          
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.max(0, ((userStats.level + 1) * 500) - userStats.totalScore).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">points to next level</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
