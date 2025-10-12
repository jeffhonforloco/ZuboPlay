import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Clock,
  Star,
  Target,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";
import AdminNavigation from "@/components/AdminNavigation";

interface GameStats {
  totalGames: number;
  averageScore: number;
  topScore: number;
  averagePlayTime: number;
  retentionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

interface PlayerRanking {
  username: string;
  totalGames: number;
  averageScore: number;
  bestScore: number;
}

const GameAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    averageScore: 0,
    topScore: 0,
    averagePlayTime: 0,
    retentionRate: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0
  });
  const [topPlayers, setTopPlayers] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setTime(0);
      }

      // Load user data
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (usersError) throw usersError;

      // Calculate statistics
      const totalGames = users?.reduce((sum, user) => sum + (user.total_games_played || 0), 0) || 0;
      const averageScore = users?.length > 0 ? Math.round(totalGames / users.length) : 0;
      const topScore = Math.max(...(users?.map(u => u.total_games_played || 0) || [0]));
      
      // Calculate retention (users who played more than once)
      const activeUsers = users?.filter(u => u.total_games_played > 0) || [];
      const retentionRate = users?.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0;

      // Calculate DAU, WAU, MAU (simplified)
      const dailyActiveUsers = users?.filter(u => {
        const lastActive = new Date(u.created_at);
        return lastActive > new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }).length || 0;

      const weeklyActiveUsers = users?.filter(u => {
        const lastActive = new Date(u.created_at);
        return lastActive > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }).length || 0;

      const monthlyActiveUsers = users?.filter(u => {
        const lastActive = new Date(u.created_at);
        return lastActive > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }).length || 0;

      setStats({
        totalGames,
        averageScore,
        topScore,
        averagePlayTime: 0, // Would need more detailed tracking
        retentionRate,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers
      });

      // Get top players
      const sortedPlayers = users
        ?.filter(u => u.total_games_played > 0)
        .sort((a, b) => (b.total_games_played || 0) - (a.total_games_played || 0))
        .slice(0, 10)
        .map(user => ({
          username: user.username,
          totalGames: user.total_games_played || 0,
          averageScore: user.total_games_played || 0,
          bestScore: user.total_games_played || 0
        })) || [];

      setTopPlayers(sortedPlayers);

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      default: return "All time";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Game Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Detailed game statistics and player insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {getTimeRangeLabel()}
              </Badge>
              <Button
                variant="outline"
                onClick={loadAnalytics}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl md:ml-72">
        {/* Time Range Selector */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            {[
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "all", label: "All Time" }
            ].map((range) => (
              <Button
                key={range.key}
                variant={timeRange === range.key ? "default" : "outline"}
                onClick={() => setTimeRange(range.key as any)}
                size="sm"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalGames.toLocaleString()}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{stats.averageScore}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.retentionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Score</p>
                <p className="text-2xl font-bold text-foreground">{stats.topScore}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* User Activity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Active Users</p>
                <p className="text-xl font-bold text-foreground">{stats.dailyActiveUsers}</p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Active Users</p>
                <p className="text-xl font-bold text-foreground">{stats.weeklyActiveUsers}</p>
              </div>
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Active Users</p>
                <p className="text-xl font-bold text-foreground">{stats.monthlyActiveUsers}</p>
              </div>
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Top Players */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Players
          </h3>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.username} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{player.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.totalGames} games played
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{player.totalGames}</p>
                  <p className="text-sm text-muted-foreground">total score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameAnalytics;
