import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (user) {
      // Fetch username from profiles table
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setUsername(data.username);
        }
      };
      
      // Use setTimeout to defer Supabase call
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="border-2 border-foreground/20 bg-background/50 backdrop-blur-sm hover:bg-background/80 font-bold rounded-full"
        >
          Sign In
        </Button>
        <Button
          onClick={() => navigate("/auth")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full"
        >
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
        <User className="w-5 h-5 text-primary" />
        <span className="font-bold text-foreground">{username || "Player"}</span>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="border-2 border-foreground/20 rounded-full"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};
