import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const ZUBO_SIZE = 50;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const GAME_SPEED = 5;

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "platform" | "spike";
};

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

const Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [zuboY, setZuboY] = useState(GAME_HEIGHT - ZUBO_SIZE - 50);
  const [zuboVelocity, setZuboVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const [zuboDesign, setZuboDesign] = useState<{
    bodyType: BodyType;
    legType: LegType;
    color: string;
  }>({
    bodyType: "sphere",
    legType: "springy",
    color: "#FF6B9D"
  });

  // Load user's Zubo design and high score
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("favorite_zubo_design, total_games_played")
        .eq("id", user.id)
        .single();
      
      if (data?.favorite_zubo_design) {
        const design = data.favorite_zubo_design as { bodyType: BodyType; legType: LegType; color: string };
        setZuboDesign(design);
      }
      
      if (data?.total_games_played) {
        setHighScore(data.total_games_played * 100); // Mock high score
      }
    };
    
    loadUserData();
  }, [user]);

  // Generate obstacles
  const generateObstacle = useCallback((lastX: number): Obstacle => {
    const gap = 200 + Math.random() * 200;
    const x = lastX + gap;
    const isSpike = Math.random() > 0.5;
    
    if (isSpike) {
      return {
        x,
        y: GAME_HEIGHT - 70,
        width: 40,
        height: 40,
        type: "spike"
      };
    } else {
      return {
        x,
        y: GAME_HEIGHT - 150 - Math.random() * 100,
        width: 80,
        height: 20,
        type: "platform"
      };
    }
  }, []);

  // Initialize obstacles
  useEffect(() => {
    if (gameState === "playing" && obstacles.length === 0) {
      const initialObstacles: Obstacle[] = [];
      let lastX = GAME_WIDTH;
      for (let i = 0; i < 5; i++) {
        const obstacle = generateObstacle(lastX);
        initialObstacles.push(obstacle);
        lastX = obstacle.x;
      }
      setObstacles(initialObstacles);
    }
  }, [gameState, obstacles.length, generateObstacle]);

  // Jump handler
  const jump = useCallback(() => {
    if (gameState !== "playing") return;
    if (!isJumping) {
      setZuboVelocity(JUMP_FORCE);
      setIsJumping(true);
      
      // Play jump sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [gameState, isJumping]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      // Update Zubo position
      setZuboVelocity(prev => prev + GRAVITY);
      setZuboY(prev => {
        const newY = prev + zuboVelocity;
        const groundY = GAME_HEIGHT - ZUBO_SIZE - 50;
        
        if (newY >= groundY) {
          setIsJumping(false);
          return groundY;
        }
        return newY;
      });

      // Update obstacles
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          x: obs.x - GAME_SPEED
        }));

        // Remove off-screen obstacles and add new ones
        const filtered = updated.filter(obs => obs.x > -100);
        if (filtered.length < 5) {
          const lastObs = filtered[filtered.length - 1];
          filtered.push(generateObstacle(lastObs ? lastObs.x : GAME_WIDTH));
        }

        return filtered;
      });

      // Update scroll and score
      setScrollOffset(prev => prev + GAME_SPEED);
      setScore(prev => prev + 1);

      // Check collisions
      const zuboX = 100;
      const zuboBottom = zuboY + ZUBO_SIZE;
      
      obstacles.forEach(obs => {
        const collision = 
          zuboX + ZUBO_SIZE > obs.x &&
          zuboX < obs.x + obs.width &&
          zuboY + ZUBO_SIZE > obs.y &&
          zuboY < obs.y + obs.height;

        if (collision && obs.type === "spike") {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState("gameover");
              saveScore();
            }
            return newLives;
          });
          // Remove the spike that hit
          setObstacles(prev => prev.filter(o => o !== obs));
        }
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, zuboVelocity, zuboY, obstacles, generateObstacle]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1A1F2C";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = "#403E43";
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    // Draw obstacles
    obstacles.forEach(obs => {
      if (obs.type === "spike") {
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#9b87f5";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      }
    });

    // Draw Zubo
    const zuboX = 100;
    ctx.fillStyle = zuboDesign.color;
    
    if (zuboDesign.bodyType === "sphere") {
      ctx.beginPath();
      ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2, ZUBO_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (zuboDesign.bodyType === "cube") {
      ctx.fillRect(zuboX, zuboY, ZUBO_SIZE, ZUBO_SIZE);
    } else {
      ctx.fillRect(zuboX + 10, zuboY, ZUBO_SIZE - 20, ZUBO_SIZE);
    }

    // Draw legs
    ctx.fillStyle = zuboDesign.color;
    if (zuboDesign.legType === "springy") {
      ctx.fillRect(zuboX + 10, zuboY + ZUBO_SIZE, 10, 15);
      ctx.fillRect(zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 10, 15);
    } else {
      ctx.fillRect(zuboX + 15, zuboY + ZUBO_SIZE, 8, 8);
      ctx.fillRect(zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE, 8, 8);
    }
  }, [obstacles, zuboY, zuboDesign]);

  const saveScore = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ total_games_played: Math.floor(score / 100) })
        .eq("id", user.id);

      if (error) throw error;

      if (score > highScore) {
        setHighScore(score);
        toast({
          title: "New High Score!",
          description: `You scored ${score} points!`,
        });
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setLives(3);
    setZuboY(GAME_HEIGHT - ZUBO_SIZE - 50);
    setZuboVelocity(0);
    setObstacles([]);
    setScrollOffset(0);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-foreground mb-2">Zubo Jump</h1>
            <p className="text-muted-foreground">Tap Space or Click to Jump!</p>
          </div>

          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{highScore}</div>
              <div className="text-sm text-muted-foreground">High Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-foreground">{"❤️".repeat(lives)}</div>
              <div className="text-sm text-muted-foreground">Lives</div>
            </div>
          </div>

          <div className="relative bg-muted/30 rounded-xl overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, margin: "0 auto" }}>
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              onClick={jump}
              className="cursor-pointer"
            />
            
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Ready to Jump?</h2>
                  <Button size="lg" onClick={startGame}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Paused</h2>
                  <Button size="lg" onClick={() => setGameState("playing")}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                </div>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                  <p className="text-xl mb-4">Final Score: {score}</p>
                  <Button size="lg" onClick={startGame}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            {gameState === "playing" && (
              <Button variant="outline" onClick={() => setGameState("paused")}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>🎮 Press SPACE or CLICK to jump</p>
            <p>⚠️ Avoid red spikes! Jump on purple platforms!</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Game;
