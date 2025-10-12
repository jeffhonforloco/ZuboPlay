import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signUpSchema, signInSchema, SignUpData, SignInData } from "@/lib/auth";
import { z } from "zod";

type AuthMode = "signin" | "signup";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const data: SignUpData = { email, password, username };
        const result = signUpSchema.safeParse(data);
        
        if (!result.success) {
          const firstError = result.error.errors[0];
          toast({
            title: "Validation Error",
            description: firstError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(data);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome to ZuboPlay!",
            description: "Your account has been created successfully.",
          });
          navigate("/");
        }
      } else {
        const data: SignInData = { email, password };
        const result = signInSchema.safeParse(data);
        
        if (!result.success) {
          const firstError = result.error.errors[0];
          toast({
            title: "Validation Error",
            description: firstError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(data);
        
        if (error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-4 md:p-8 bg-card border-2 border-primary/20">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 text-responsive">
          {mode === "signin" ? "Welcome Back!" : "Join ZuboPlay"}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground text-responsive">
          {mode === "signin" 
            ? "Sign in to access your Zubos" 
            : "Create an account to start building Zubos"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="player123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={20}
              className="border-2"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="border-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border-2"
          />
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg py-4 md:py-6 rounded-full touch-target mobile-bounce"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setEmail("");
            setPassword("");
            setUsername("");
          }}
          className="text-sm text-primary hover:underline font-medium"
        >
          {mode === "signin" 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"}
        </button>
      </div>
    </Card>
  );
};
