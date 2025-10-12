import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Server, 
  Database, 
  Mail, 
  Bell,
  Save,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";
import AdminNavigation from "@/components/AdminNavigation";

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  analyticsEnabled: boolean;
  debugMode: boolean;
  maxUsers: number;
  gameSpeed: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const SystemSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    analyticsEnabled: true,
    debugMode: false,
    maxUsers: 10000,
    gameSpeed: 5,
    soundEnabled: true,
    musicEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app, this would come from your database
      // For now, we'll use the default settings
      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load system settings.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Mock save - in a real app, this would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "System settings saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save system settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getSystemStatus = () => {
    if (settings.maintenanceMode) {
      return { status: "Maintenance", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    }
    if (settings.debugMode) {
      return { status: "Debug", color: "text-blue-600", bgColor: "bg-blue-50" };
    }
    return { status: "Operational", color: "text-green-600", bgColor: "bg-green-50" };
  };

  const systemStatus = getSystemStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
                  System Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure system-wide settings and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${systemStatus.bgColor} ${systemStatus.color}`}>
                {systemStatus.status}
              </Badge>
              <Button
                variant="outline"
                onClick={loadSettings}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl md:ml-72">
        {/* System Status */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-foreground">Database</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Server className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-foreground">API Server</p>
              <p className="text-sm text-muted-foreground">Running</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-foreground">Security</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Disable public access for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Registration Enabled</p>
                <p className="text-sm text-muted-foreground">Allow new user registrations</p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => handleSettingChange("registrationEnabled", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Debug Mode</p>
                <p className="text-sm text-muted-foreground">Enable debug logging and features</p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => handleSettingChange("debugMode", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Send push notifications to users</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Game Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Game Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Max Users</label>
              <Input
                type="number"
                value={settings.maxUsers}
                onChange={(e) => handleSettingChange("maxUsers", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Game Speed</label>
              <Input
                type="number"
                value={settings.gameSpeed}
                onChange={(e) => handleSettingChange("gameSpeed", parseInt(e.target.value))}
                className="w-full"
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Enable game sound effects</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground">Enable background music</p>
              </div>
              <Switch
                checked={settings.musicEnabled}
                onCheckedChange={(checked) => handleSettingChange("musicEnabled", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Analytics Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Analytics Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Analytics Enabled</p>
                <p className="text-sm text-muted-foreground">Collect usage analytics and statistics</p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => handleSettingChange("analyticsEnabled", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
