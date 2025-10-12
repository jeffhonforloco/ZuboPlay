import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Music, 
  Image, 
  Save,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";
import AdminNavigation from "@/components/AdminNavigation";

interface GameContent {
  id: string;
  type: "color" | "sound" | "feature" | "announcement";
  name: string;
  description: string;
  value: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const ContentManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<GameContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GameContent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState({
    type: "color" as const,
    name: "",
    description: "",
    value: "",
    enabled: true
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app, this would come from your database
      const mockContent: GameContent[] = [
        {
          id: "1",
          type: "color",
          name: "Neon Pink",
          description: "Bright neon pink color for Zubo bodies",
          value: "#FF1493",
          enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "2",
          type: "color",
          name: "Electric Blue",
          description: "Vibrant electric blue color",
          value: "#00BFFF",
          enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "3",
          type: "sound",
          name: "Jump Sound",
          description: "Default jump sound effect",
          value: "jump_default.wav",
          enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "4",
          type: "feature",
          name: "Double Jump",
          description: "Allow players to double jump",
          value: "enabled",
          enabled: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "5",
          type: "announcement",
          name: "New Features",
          description: "Announcement about new game features",
          value: "Check out our latest updates!",
          enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      ];
      setContent(mockContent);
    } catch (error) {
      console.error("Error loading content:", error);
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        setContent(prev => prev.map(item => 
          item.id === editingItem.id ? { ...editingItem, updated_at: new Date().toISOString() } : item
        ));
        toast({
          title: "Success",
          description: "Content updated successfully.",
        });
        setEditingItem(null);
      } else {
        // Add new item
        const newItem: GameContent = {
          id: Date.now().toString(),
          ...newContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setContent(prev => [newItem, ...prev]);
        toast({
          title: "Success",
          description: "Content added successfully.",
        });
        setShowAddForm(false);
        setNewContent({
          type: "color",
          name: "",
          description: "",
          value: "",
          enabled: true
        });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setContent(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Content deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  const toggleEnabled = async (id: string) => {
    try {
      setContent(prev => prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled, updated_at: new Date().toISOString() } : item
      ));
      toast({
        title: "Success",
        description: "Content status updated.",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "Failed to update content.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "color": return <Palette className="w-4 h-4" />;
      case "sound": return <Music className="w-4 h-4" />;
      case "feature": return <Settings className="w-4 h-4" />;
      case "announcement": return <Image className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "color": return "text-pink-600 bg-pink-50";
      case "sound": return "text-blue-600 bg-blue-50";
      case "feature": return "text-green-600 bg-green-50";
      case "announcement": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
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
                  Content Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage game content, features, and announcements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadContent}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl md:ml-72">
        {/* Add/Edit Form */}
        {(showAddForm || editingItem) && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingItem ? "Edit Content" : "Add New Content"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <select
                  value={editingItem?.type || newContent.type}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, type: e.target.value as any });
                    } else {
                      setNewContent({ ...newContent, type: e.target.value as any });
                    }
                  }}
                  className="w-full p-2 border border-border rounded-md"
                >
                  <option value="color">Color</option>
                  <option value="sound">Sound</option>
                  <option value="feature">Feature</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  value={editingItem?.name || newContent.name}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, name: e.target.value });
                    } else {
                      setNewContent({ ...newContent, name: e.target.value });
                    }
                  }}
                  placeholder="Enter content name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  value={editingItem?.description || newContent.description}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, description: e.target.value });
                    } else {
                      setNewContent({ ...newContent, description: e.target.value });
                    }
                  }}
                  placeholder="Enter content description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Value</label>
                <Input
                  value={editingItem?.value || newContent.value}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, value: e.target.value });
                    } else {
                      setNewContent({ ...newContent, value: e.target.value });
                    }
                  }}
                  placeholder="Enter content value"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingItem?.enabled ?? newContent.enabled}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, enabled: e.target.checked });
                    } else {
                      setNewContent({ ...newContent, enabled: e.target.checked });
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-foreground">
                  Enabled
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingItem ? "Update" : "Add"} Content
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setShowAddForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEnabled(item.id)}
                    className="p-1"
                  >
                    {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                    className="p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={item.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {item.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm">{new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
