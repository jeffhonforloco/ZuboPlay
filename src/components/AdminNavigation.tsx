import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const AdminNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/content", label: "Content", icon: Settings },
    { path: "/admin/settings", label: "System", icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border-2 touch-target"
        aria-label="Open admin menu"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Desktop Navigation */}
      <Card className="hidden md:block w-64 h-fit p-4 sticky top-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Admin Panel</h3>
          </div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant={active ? "default" : "ghost"}
                onClick={() => navigate(item.path)}
                className={`w-full justify-start text-left ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Navigation Panel */}
          <Card className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-sm border-r-2 border-primary/20 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="touch-target"
                  aria-label="Close admin menu"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Button
                      key={item.path}
                      variant={active ? "default" : "ghost"}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start text-left touch-target ${
                        active 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  ZuboPlay Admin Panel
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminNavigation;
