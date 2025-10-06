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
  type: "platform" | "spike" | "coin";
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
  const [coins, setCoins] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
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

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timerInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [gameState]);

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

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with gradient sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground with cartoon style
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 50, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, "#8BC34A");
    groundGradient.addColorStop(1, "#689F38");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
    
    // Ground outline
    ctx.strokeStyle = "#558B2F";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - 50);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 50);
    ctx.stroke();

    // Draw obstacles with cartoon style
    obstacles.forEach(obs => {
      if (obs.type === "spike") {
        // Spike with cartoon outline
        ctx.fillStyle = "#FF4444";
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        
        // Spike outline
        ctx.strokeStyle = "#CC0000";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = "#FF8888";
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + 5);
        ctx.lineTo(obs.x + 5, obs.y + obs.height - 5);
        ctx.lineTo(obs.x + obs.width / 2 - 3, obs.y + obs.height - 5);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === "coin") {
        // Coin with glow effect
        const glowGradient = ctx.createRadialGradient(
          obs.x + obs.width / 2, obs.y + obs.height / 2, 0,
          obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2 + 5
        );
        glowGradient.addColorStop(0, "#FFD700");
        glowGradient.addColorStop(0.7, "#FFA500");
        glowGradient.addColorStop(1, "rgba(255, 165, 0, 0)");
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Main coin
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin outline
        ctx.strokeStyle = "#DAA520";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Music note symbol
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("♪", obs.x + obs.width / 2, obs.y + obs.height / 2);
      } else {
        // Platform with cartoon style
        const platformGradient = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
        platformGradient.addColorStop(0, "#9b87f5");
        platformGradient.addColorStop(1, "#7E69D6");
        ctx.fillStyle = platformGradient;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Platform outline
        ctx.strokeStyle = "#6B5AC7";
        ctx.lineWidth = 3;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        
        // Highlight on top
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height / 3);
      }
    });

    // Draw Zubo with cartoon style
    const zuboX = 100;
    
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(zuboX + ZUBO_SIZE / 2, GAME_HEIGHT - 45, ZUBO_SIZE / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Zubo body
    if (zuboDesign.bodyType === "sphere") {
      // Gradient for sphere
      const bodyGradient = ctx.createRadialGradient(
        zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 10, 5,
        zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2, ZUBO_SIZE / 2
      );
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 30));
      bodyGradient.addColorStop(1, zuboDesign.color);
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2, ZUBO_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Outline
      ctx.strokeStyle = darkenColor(zuboDesign.color, 30);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (zuboDesign.bodyType === "cube") {
      // Gradient for cube
      const bodyGradient = ctx.createLinearGradient(zuboX, zuboY, zuboX, zuboY + ZUBO_SIZE);
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      bodyGradient.addColorStop(1, zuboDesign.color);
      
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(zuboX, zuboY, ZUBO_SIZE, ZUBO_SIZE);
      
      // Outline
      ctx.strokeStyle = darkenColor(zuboDesign.color, 30);
      ctx.lineWidth = 3;
      ctx.strokeRect(zuboX, zuboY, ZUBO_SIZE, ZUBO_SIZE);
    } else {
      // Tube
      const bodyGradient = ctx.createLinearGradient(zuboX + 10, zuboY, zuboX + 10, zuboY + ZUBO_SIZE);
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      bodyGradient.addColorStop(1, zuboDesign.color);
      
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(zuboX + 10, zuboY, ZUBO_SIZE - 20, ZUBO_SIZE);
      
      // Outline
      ctx.strokeStyle = darkenColor(zuboDesign.color, 30);
      ctx.lineWidth = 3;
      ctx.strokeRect(zuboX + 10, zuboY, ZUBO_SIZE - 20, ZUBO_SIZE);
    }

    // Draw eyes
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 6, 0, Math.PI * 2);
    ctx.arc(zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.arc(zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw smile
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2 + 5, 12, 0, Math.PI);
    ctx.stroke();

    // Draw legs with outline
    if (zuboDesign.legType === "springy") {
      ctx.fillStyle = zuboDesign.color;
      ctx.fillRect(zuboX + 10, zuboY + ZUBO_SIZE, 10, 15);
      ctx.fillRect(zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 10, 15);
      
      ctx.strokeStyle = darkenColor(zuboDesign.color, 30);
      ctx.lineWidth = 2;
      ctx.strokeRect(zuboX + 10, zuboY + ZUBO_SIZE, 10, 15);
      ctx.strokeRect(zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 10, 15);
    } else {
      ctx.fillStyle = zuboDesign.color;
      ctx.fillRect(zuboX + 15, zuboY + ZUBO_SIZE, 8, 8);
      ctx.fillRect(zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE, 8, 8);
      
      ctx.strokeStyle = darkenColor(zuboDesign.color, 30);
      ctx.lineWidth = 2;
      ctx.strokeRect(zuboX + 15, zuboY + ZUBO_SIZE, 8, 8);
      ctx.strokeRect(zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE, 8, 8);
    }
    
    // Helper functions for color manipulation
    function lightenColor(color: string, percent: number): string {
      const num = parseInt(color.replace("#",""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }
    
    function darkenColor(color: string, percent: number): string {
      const num = parseInt(color.replace("#",""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return "#" + (0x1000000 + (R>0?R:0)*0x10000 + (G>0?G:0)*0x100 + (B>0?B:0)).toString(16).slice(1);
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
    setCoins(3);
    setTimeElapsed(0);
    setZuboY(GAME_HEIGHT - ZUBO_SIZE - 50);
    setZuboVelocity(0);
    setObstacles([]);
    setScrollOffset(0);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl border-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-black text-foreground mb-2 drop-shadow-lg">Zubo Jump</h1>
            <p className="text-sm md:text-base text-muted-foreground">Tap or Press Space to Jump!</p>
          </div>

          <div className="flex justify-between mb-4 gap-2">
            <div className="text-center bg-primary/10 px-4 py-2 rounded-xl border-2 border-primary/20">
              <div className="text-xl md:text-2xl font-bold text-primary drop-shadow">{score}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center bg-secondary/10 px-4 py-2 rounded-xl border-2 border-secondary/20">
              <div className="text-xl md:text-2xl font-bold text-secondary drop-shadow">{formatTime(timeElapsed)}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Time</div>
            </div>
            <div className="text-center bg-accent/10 px-4 py-2 rounded-xl border-2 border-accent/20">
              <div className="text-xl md:text-2xl font-bold text-accent drop-shadow">{highScore}</div>
              <div className="text-xs md:text-sm text-muted-foreground">High Score</div>
            </div>
            <div className="text-center bg-muted px-4 py-2 rounded-xl border-2 border-border">
              <div className="text-xl md:text-2xl font-bold">{"🎵".repeat(Math.max(0, coins))}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Lives</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-accent/5 to-primary/5 rounded-2xl overflow-hidden mx-auto border-4 border-primary/20 shadow-2xl" style={{ maxWidth: "100%", width: GAME_WIDTH, height: GAME_HEIGHT }}>
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              onClick={jump}
              className="cursor-pointer"
            />
            
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center animate-bounce-slow">
                  <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Jump?</h2>
                  <Button size="lg" onClick={startGame} className="shadow-lg hover:shadow-xl transition-shadow">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Paused</h2>
                  <Button size="lg" onClick={() => setGameState("playing")} className="shadow-lg hover:shadow-xl transition-shadow">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                </div>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2 drop-shadow-lg text-destructive">Game Over!</h2>
                  <p className="text-xl mb-2">Final Score: <span className="font-bold text-primary">{score}</span></p>
                  <p className="text-lg mb-4">Time Survived: <span className="font-bold text-secondary">{formatTime(timeElapsed)}</span></p>
                  <Button size="lg" onClick={startGame} className="shadow-lg hover:shadow-xl transition-shadow">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            {gameState === "playing" && (
              <Button variant="outline" onClick={() => setGameState("paused")} className="shadow-md hover:shadow-lg transition-shadow border-2">
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
