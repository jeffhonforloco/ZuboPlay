import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/80 to-accent/20 p-6">
      <Card className="p-12 text-center bg-background/80 backdrop-blur-sm border-2 border-primary/30 shadow-[0_8px_32px_hsl(var(--primary)/0.3)] max-w-md w-full">
        <div className="text-8xl font-black text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Oops! Page not found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
