import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gamepad2, 
  TrendingUp, 
  Settings, 
  Shield, 
  BarChart3,
  UserCheck,
  AlertTriangle,
  Clock,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";
import AdminNavigation from "@/components/AdminNavigation";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  averageScore: number;
  topPlayer: string;
  recentSignups: number;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    averageScore: 0,
    topPlayer: "",
    recentSignups: 0
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin (you can implement your own admin logic)
  const isAdmin = user?.email === "admin@zuboplay.com" || user?.user_metadata?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadAdminStats();
  }, [isAdmin, navigate, toast]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, username, created_at, total_games_played");

      if (usersError) throw usersError;

      // Calculate stats
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.total_games_played > 0).length || 0;
      const totalGames = users?.reduce((sum, u) => sum + (u.total_games_played || 0), 0) || 0;
      const averageScore = totalGames > 0 ? Math.round(totalGames / totalUsers) : 0;
      
      // Get top player
      const topPlayer = users?.reduce((top, current) => 
        (current.total_games_played || 0) > (top.total_games_played || 0) ? current : top
      )?.username || "None";

      // Recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSignups = users?.filter(u => 
        new Date(u.created_at) > weekAgo
      ).length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalGames,
        averageScore,
        topPlayer,
        recentSignups
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${stats.recentSignups} this week`
    },
    {
      title: "Active Players",
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`
    },
    {
      title: "Total Games",
      value: stats.totalGames.toLocaleString(),
      icon: Gamepad2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `${stats.averageScore} avg per user`
    },
    {
      title: "Top Player",
      value: stats.topPlayer,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "Highest score"
    }
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => navigate("/admin/users")
    },
    {
      title: "Game Analytics",
      description: "View detailed game statistics and trends",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => navigate("/admin/analytics")
    },
    {
      title: "Content Management",
      description: "Manage game content and features",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => navigate("/admin/content")
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      onClick: () => navigate("/admin/settings")
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your ZuboPlay platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminStats}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl md:ml-72">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="p-4 hover:shadow-md transition-all cursor-pointer hover:scale-105"
                onClick={action.onClick}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Response Time</span>
                <Badge className="bg-green-100 text-green-800">Fast</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Sessions</span>
                <Badge className="bg-blue-100 text-blue-800">{stats.activeUsers}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Alerts & Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{stats.recentSignups} new users this week</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Consider adding new game features</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
