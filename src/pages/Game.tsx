import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Game3DScene } from "@/components/game/Game3DScene";

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
  type: "platform" | "spike" | "coin";
};

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

const Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const animationRef = useRef<number>();
  
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(3);
  
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
    const rand = Math.random();
    
    if (rand > 0.7) {
      // Coin
      return {
        x,
        y: GAME_HEIGHT - 150 - Math.random() * 150,
        width: 30,
        height: 30,
        type: "coin"
      };
    } else if (rand > 0.4) {
      // Spike
      return {
        x,
        y: GAME_HEIGHT - 70,
        width: 40,
        height: 40,
        type: "spike"
      };
    } else {
      // Platform
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
      
      // Play jump sound (musical note)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 523.25; // C5 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, [gameState, isJumping]);

  // Play coin collection sound
  const playCoinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 784; // G5 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  // Keyboard and touch controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };
    
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
    };
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

        if (collision) {
          if (obs.type === "spike") {
            setCoins(prev => {
              const newCoins = prev - 1;
              if (newCoins <= 0) {
                setGameState("gameover");
                saveScore();
              }
              return newCoins;
            });
            setObstacles(prev => prev.filter(o => o !== obs));
          } else if (obs.type === "coin") {
            setCoins(prev => prev + 1);
            setScore(prev => prev + 50);
            playCoinSound();
            setObstacles(prev => prev.filter(o => o !== obs));
          }
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
  }, [gameState, zuboVelocity, zuboY, obstacles, generateObstacle, playCoinSound]);

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
    setCoins(3);
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
            <h1 className="text-2xl md:text-4xl font-black text-foreground mb-2">Zubo Jump</h1>
            <p className="text-sm md:text-base text-muted-foreground">Tap or Press Space to Jump!</p>
          </div>

          <div className="flex justify-between mb-4 gap-2">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">{score}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-accent">{highScore}</div>
              <div className="text-xs md:text-sm text-muted-foreground">High Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold">{"🎵".repeat(Math.max(0, coins))}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Note Coins</div>
            </div>
          </div>

          <div className="relative bg-muted/30 rounded-xl overflow-hidden mx-auto" style={{ maxWidth: "100%", width: GAME_WIDTH, height: GAME_HEIGHT }}>
            <Canvas
              shadows
              onClick={jump}
              className="cursor-pointer"
              style={{ width: "100%", height: "100%" }}
            >
              <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
              <Game3DScene
                zuboY={zuboY}
                zuboDesign={zuboDesign}
                obstacles={obstacles}
                isJumping={isJumping}
              />
            </Canvas>
            
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

          <div className="mt-6 text-center text-xs md:text-sm text-muted-foreground space-y-1">
            <p>🎮 Tap Screen / Press SPACE to jump</p>
            <p>🎵 Collect golden Note Coins for extra lives!</p>
            <p>⚠️ Avoid red spikes! Jump on purple platforms!</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Game;
