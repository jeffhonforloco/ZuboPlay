import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, X, Home, Gamepad2, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/game", label: "Play", icon: Gamepad2 },
    ...(user ? [{ path: "/auth", label: "Profile", icon: User }] : []),
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border-2 touch-target"
        aria-label="Open mobile menu"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <Card className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-sm border-r-2 border-primary/20 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="touch-target"
                  aria-label="Close mobile menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full justify-start text-left p-4 h-auto touch-target mobile-bounce ${
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>

              {/* User Section */}
              {user && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Welcome back!</p>
                      <p className="text-xs text-muted-foreground">Ready to play?</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  ZuboPlay • Rhythm Realms
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
