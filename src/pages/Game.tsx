import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Pause, RotateCcw, Settings } from "lucide-react";
import SettingsComponent from "@/components/Settings";
import MobileNavigation from "@/components/MobileNavigation";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const ZUBO_SIZE = 60;
const GRAVITY = 0.7; // Balanced gravity for responsive gameplay
const JUMP_FORCE = -12; // Responsive jump force for fun gameplay
const GAME_SPEED = 5;

// Professional level system for app stores
const LEVELS = [
  { level: 1, name: "Beginner", requiredScore: 0, speed: 5, gravity: 0.7, jumpForce: -12, obstacleGap: 200, color: "#4CAF50" },
  { level: 2, name: "Novice", requiredScore: 50, speed: 6, gravity: 0.8, jumpForce: -13, obstacleGap: 180, color: "#2196F3" },
  { level: 3, name: "Skilled", requiredScore: 150, speed: 7, gravity: 0.9, jumpForce: -14, obstacleGap: 160, color: "#FF9800" },
  { level: 4, name: "Expert", requiredScore: 300, speed: 8, gravity: 1.0, jumpForce: -15, obstacleGap: 140, color: "#9C27B0" },
  { level: 5, name: "Master", requiredScore: 500, speed: 9, gravity: 1.1, jumpForce: -16, obstacleGap: 120, color: "#F44336" },
  { level: 6, name: "Legend", requiredScore: 750, speed: 10, gravity: 1.2, jumpForce: -17, obstacleGap: 100, color: "#FFD700" },
  { level: 7, name: "Champion", requiredScore: 1000, speed: 11, gravity: 1.3, jumpForce: -18, obstacleGap: 80, color: "#E91E63" },
  { level: 8, name: "Grandmaster", requiredScore: 1500, speed: 12, gravity: 1.4, jumpForce: -19, obstacleGap: 60, color: "#00BCD4" },
  { level: 9, name: "Supreme", requiredScore: 2000, speed: 13, gravity: 1.5, jumpForce: -20, obstacleGap: 40, color: "#795548" },
  { level: 10, name: "Ultimate", requiredScore: 3000, speed: 15, gravity: 1.6, jumpForce: -22, obstacleGap: 30, color: "#607D8B" }
];

// Achievement system
const ACHIEVEMENTS = [
  { id: "first_jump", name: "First Jump", description: "Make your first jump!", icon: "🦘", points: 10 },
  { id: "level_2", name: "Rising Star", description: "Reach Level 2", icon: "⭐", points: 50 },
  { id: "level_5", name: "Master Player", description: "Reach Level 5", icon: "👑", points: 200 },
  { id: "level_10", name: "Ultimate Champion", description: "Reach Level 10", icon: "🏆", points: 500 },
  { id: "score_1000", name: "Thousand Points", description: "Score 1000 points", icon: "💯", points: 100 },
  { id: "score_5000", name: "High Scorer", description: "Score 5000 points", icon: "🎯", points: 300 },
  { id: "score_10000", name: "Point Master", description: "Score 10000 points", icon: "🔥", points: 500 },
  { id: "survive_60", name: "Survivor", description: "Survive for 60 seconds", icon: "⏰", points: 150 },
  { id: "survive_120", name: "Endurance", description: "Survive for 2 minutes", icon: "💪", points: 300 },
  { id: "coins_50", name: "Coin Collector", description: "Collect 50 coins", icon: "🪙", points: 200 },
  { id: "perfect_run", name: "Perfect Run", description: "Complete a level without losing a life", icon: "✨", points: 250 }
];

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "platform" | "spike" | "coin" | "shield" | "speed" | "magnet";
};

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

const Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [canvasScale, setCanvasScale] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Level and progression system
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalCoins, setTotalCoins] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState<{id: string, name: string, icon: string} | null>(null);
  const [perfectRun, setPerfectRun] = useState(true);
  
  // Power progression system
  const [powerLevel, setPowerLevel] = useState(1);
  const [powerPoints, setPowerPoints] = useState(0);
  const [canDoubleJump, setCanDoubleJump] = useState(false);
  const [canDestroyObstacles, setCanDestroyObstacles] = useState(false);
  const [doubleJumpUsed, setDoubleJumpUsed] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showPowerUp, setShowPowerUp] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number, type: string}>>([]);
  
  // Enhanced audio system
  const [currentTrack, setCurrentTrack] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [screenShake, setScreenShake] = useState(0);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [environment, setEnvironment] = useState("forest");
  
  // Power-ups system
  const [activePowerUps, setActivePowerUps] = useState<Array<{type: string, duration: number, startTime: number}>>([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(1);
  const [magnetActive, setMagnetActive] = useState(false);
  
  const [zuboY, setZuboY] = useState(GAME_HEIGHT - ZUBO_SIZE - 50);
  const [zuboVelocity, setZuboVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Refs for current values to avoid stale closures - initialize with default values
  const zuboYRef = useRef(GAME_HEIGHT - ZUBO_SIZE - 50);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const isJumpingRef = useRef(false);
  const zuboVelocityRef = useRef(0);
  const generateObstacleRef = useRef<(lastX: number) => Obstacle>();
  
  // Update refs when state changes
  useEffect(() => {
    zuboYRef.current = zuboY;
  }, [zuboY]);
  
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  
  useEffect(() => {
    isJumpingRef.current = isJumping;
  }, [isJumping]);
  
  useEffect(() => {
    zuboVelocityRef.current = zuboVelocity;
  }, [zuboVelocity]);
  
  const [zuboDesign, setZuboDesign] = useState<{
    bodyType: BodyType;
    legType: LegType;
    color: string;
  }>({
    bodyType: "sphere",
    legType: "springy",
    color: "#FF6B9D"
  });

  const [showSettings, setShowSettings] = useState(false);

  // Helper functions for level and achievement system
  const getCurrentLevelData = () => {
    return LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  };

  const getNextLevelData = () => {
    return LEVELS.find(l => l.level === currentLevel + 1);
  };

  const checkLevelUp = (newScore: number) => {
    const nextLevel = LEVELS.find(l => l.level > currentLevel && newScore >= l.requiredScore);
    if (nextLevel) {
      setCurrentLevel(nextLevel.level);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
      return true;
    }
    return false;
  };

  const checkAchievements = (newScore: number, newCoins: number, newTime: number) => {
    const newAchievements: string[] = [];
    
    // Level achievements
    if (currentLevel >= 2 && !achievements.includes("level_2")) {
      newAchievements.push("level_2");
    }
    if (currentLevel >= 5 && !achievements.includes("level_5")) {
      newAchievements.push("level_5");
    }
    if (currentLevel >= 10 && !achievements.includes("level_10")) {
      newAchievements.push("level_10");
    }
    
    // Score achievements
    if (newScore >= 1000 && !achievements.includes("score_1000")) {
      newAchievements.push("score_1000");
    }
    if (newScore >= 5000 && !achievements.includes("score_5000")) {
      newAchievements.push("score_5000");
    }
    if (newScore >= 10000 && !achievements.includes("score_10000")) {
      newAchievements.push("score_10000");
    }
    
    // Time achievements
    if (newTime >= 60 && !achievements.includes("survive_60")) {
      newAchievements.push("survive_60");
    }
    if (newTime >= 120 && !achievements.includes("survive_120")) {
      newAchievements.push("survive_120");
    }
    
    // Coin achievements
    if (newCoins >= 50 && !achievements.includes("coins_50")) {
      newAchievements.push("coins_50");
    }
    
    // Perfect run achievement
    if (perfectRun && newScore >= getCurrentLevelData().requiredScore && !achievements.includes("perfect_run")) {
      newAchievements.push("perfect_run");
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0]);
      if (achievement) {
        setShowAchievement({ id: achievement.id, name: achievement.name, icon: achievement.icon });
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }
  };

  // Power progression system
  const updatePowerLevel = (newScore: number) => {
    const newPowerLevel = Math.floor(newScore / 1000) + 1;
    if (newPowerLevel > powerLevel) {
      setPowerLevel(newPowerLevel);
      setShowPowerUp(true);
      setTimeout(() => setShowPowerUp(false), 2000);
    }
    
    // Unlock abilities based on power level
    if (newPowerLevel >= 2 && !canDoubleJump) {
      setCanDoubleJump(true);
    }
    if (newPowerLevel >= 3 && !canDestroyObstacles) {
      setCanDestroyObstacles(true);
    }
  };

  const getPowerMultiplier = () => {
    return 1 + (powerLevel - 1) * 0.1; // 10% increase per power level for more realistic scaling
  };

  const getJumpPower = () => {
    const levelData = getCurrentLevelData();
    const powerMultiplier = getPowerMultiplier();
    return levelData.jumpForce * powerMultiplier;
  };

  // Particle system for professional effects
  const createParticles = (x: number, y: number, type: string, count: number = 5) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1.0,
        type: type
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.1, // gravity
      life: particle.life - 0.02
    })).filter(particle => particle.life > 0));
  };

  // Dynamic soundtrack system
  const playBackgroundMusic = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;
    
    try {
      // Create ambient background music based on level
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies based on level
      const baseFreq = 220 + (currentLevel * 20);
      oscillator1.frequency.value = baseFreq;
      oscillator2.frequency.value = baseFreq * 1.5;
      
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      
      gainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      
      // Stop after 2 seconds to avoid overlap
      oscillator1.stop(audioContext.currentTime + 2);
      oscillator2.stop(audioContext.currentTime + 2);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Audio not supported');
      }
    }
  }, [currentLevel, musicVolume, getAudioContext]);

  // Screen shake effect
  const triggerScreenShake = (intensity: number) => {
    setScreenShake(intensity);
    setTimeout(() => setScreenShake(0), 200);
  };

  // Generate obstacles - moved to top to avoid hoisting issues
  const generateObstacle = useCallback((lastX: number): Obstacle => {
    const levelData = getCurrentLevelData();
    const gap = levelData.obstacleGap + Math.random() * (levelData.obstacleGap * 0.5);
    const x = lastX + gap;
    const rand = Math.random();
    
    if (rand > 0.85) {
      // Power-ups (15% chance)
      const powerUpTypes = ["shield", "speed", "magnet"];
      const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      return {
        x,
        y: GAME_HEIGHT - 150 - Math.random() * 150,
        width: 25,
        height: 25,
        type: powerUpType as "shield" | "speed" | "magnet"
      };
    } else if (rand > 0.7) {
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

  // Update generateObstacle ref when function changes
  useEffect(() => {
    generateObstacleRef.current = generateObstacle;
  }, [generateObstacle]);

  // Audio context ref for better performance
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio context once
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Audio not supported');
        }
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

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

  // Enhanced jump handler with double-tap and power progression
  const jump = useCallback(() => {
    if (gameState !== "playing") return;
    
    const currentTime = Date.now();
    const isDoubleTap = currentTime - lastTapTime < 300; // 300ms double-tap window
    
    // Regular jump
    if (!isJumpingRef.current) {
      const jumpPower = getJumpPower();
      setZuboVelocity(jumpPower);
      setIsJumping(true);
      setDoubleJumpUsed(false);
      
      // Create jump particles
      createParticles(100 + ZUBO_SIZE / 2, zuboYRef.current + ZUBO_SIZE, "jump", 8);
      
      // Check for first jump achievement
      if (!achievements.includes("first_jump")) {
        setAchievements(prev => [...prev, "first_jump"]);
        setShowAchievement({ id: "first_jump", name: "First Jump", icon: "🦘" });
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }
    // Double jump (if available and not used)
    else if (canDoubleJump && !doubleJumpUsed && isDoubleTap) {
      const jumpPower = getJumpPower() * 0.6; // More realistic double jump (60% of regular jump)
      setZuboVelocity(jumpPower);
      setDoubleJumpUsed(true);
      
      // Play double jump sound
      const audioContext = getAudioContext();
      if (audioContext) {
        try {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 659.25; // E5 note for double jump
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Audio not supported');
          }
        }
      }
    }
    
    setLastTapTime(currentTime);
    
    // Play jump sound (musical note) for regular jump
    if (!isDoubleTap || !canDoubleJump || doubleJumpUsed) {
      const audioContext = getAudioContext();
      if (audioContext) {
        try {
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
          if (process.env.NODE_ENV === 'development') {
            console.log('Audio not supported');
          }
        }
      }
    }
  }, [gameState, getAudioContext, canDoubleJump, doubleJumpUsed, lastTapTime]);

  // Play coin collection sound (musical arpeggio)
  const playCoinSound = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;
    
    try {
      // Play a musical arpeggio (C major chord)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.08);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Audio not supported');
      }
    }
  }, [getAudioContext]);

  // Play spike hit sound
  const playSpikeSound = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Harsh descending tone for hitting spike
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Audio not supported');
      }
    }
  }, [getAudioContext]);

  // Handle canvas scaling for responsive design
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = Math.min(1, containerWidth / GAME_WIDTH);
        setCanvasScale(scale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Keyboard and touch controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
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

  // Game loop - optimized to prevent infinite re-renders
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      const levelData = getCurrentLevelData();
      
      // Update Zubo position with level-based physics
      setZuboVelocity(prev => prev + levelData.gravity);
      setZuboY(prev => {
        const newY = prev + zuboVelocityRef.current;
        const groundY = GAME_HEIGHT - ZUBO_SIZE - 50;
        
        if (newY >= groundY) {
          setIsJumping(false);
          setDoubleJumpUsed(false); // Reset double jump when landing
          return groundY;
        }
        return newY;
      });

      // Update obstacles with level-based speed
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          x: obs.x - levelData.speed
        }));

        // Remove off-screen obstacles and add new ones
        const filtered = updated.filter(obs => obs.x > -100);
        if (filtered.length < 5) {
          const lastObs = filtered[filtered.length - 1];
          if (generateObstacleRef.current) {
            filtered.push(generateObstacleRef.current(lastObs ? lastObs.x : GAME_WIDTH));
          }
        }

        return filtered;
      });

      // Update scroll (no automatic scoring)
      setScrollOffset(prev => prev + levelData.speed);
      
      // Update particles
      updateParticles();

      // Check collisions using refs to avoid stale closures
      const zuboX = 100;
      const currentZuboY = zuboYRef.current;
      const currentObstacles = obstaclesRef.current;
      
      currentObstacles.forEach(obs => {
        const collision = 
          zuboX + ZUBO_SIZE > obs.x &&
          zuboX < obs.x + obs.width &&
          currentZuboY + ZUBO_SIZE > obs.y &&
          currentZuboY < obs.y + obs.height;

        if (collision) {
          if (obs.type === "spike") {
            // Check if Zubo can destroy obstacles
            if (canDestroyObstacles && currentZuboY < obs.y - 20) {
              // Zubo is above the spike, destroy it
              setObstacles(prev => prev.filter(o => o !== obs));
              setScore(prev => {
                const newScore = prev + 25; // More realistic destruction bonus
                updatePowerLevel(newScore);
                return newScore;
              });
              
              // Create destruction particles
              createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "destruction", 10);
              
              // Screen shake for destruction
              triggerScreenShake(3);
              
              // Play destruction sound
              const audioContext = getAudioContext();
              if (audioContext) {
                try {
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  oscillator.frequency.value = 800; // Higher pitch for destruction
                  oscillator.type = 'sawtooth';
                  
                  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                  
                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + 0.1);
                } catch (e) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Audio not supported');
                  }
                }
              }
              } else {
                // Normal spike collision
                setPerfectRun(false); // Reset perfect run on spike hit
                playSpikeSound();
                
                // Screen shake for spike hit
                triggerScreenShake(5);
                
                setCoins(prev => {
                  const newCoins = prev - 1;
                  if (newCoins <= 0) {
                    setGameState("gameover");
                    saveScore();
                  }
                  return newCoins;
                });
                setObstacles(prev => prev.filter(o => o !== obs));
              }
          } else if (obs.type === "coin") {
            setCoins(prev => prev + 1);
            setTotalCoins(prev => prev + 1);
            setScore(prev => {
              const newScore = prev + 10; // More realistic coin value
              checkLevelUp(newScore);
              checkAchievements(newScore, totalCoins + 1, timeElapsed);
              return newScore;
            });
            
            // Create coin collection particles
            createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "coin", 6);
            
            playCoinSound();
            setObstacles(prev => prev.filter(o => o !== obs));
          } else if (obs.type === "shield") {
            // Shield power-up
            setShieldActive(true);
            setActivePowerUps(prev => [...prev, { type: "shield", duration: 10000, startTime: Date.now() }]);
            createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "shield", 8);
            setObstacles(prev => prev.filter(o => o !== obs));
          } else if (obs.type === "speed") {
            // Speed boost power-up
            setSpeedBoost(1.5);
            setActivePowerUps(prev => [...prev, { type: "speed", duration: 8000, startTime: Date.now() }]);
            createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "speed", 8);
            setObstacles(prev => prev.filter(o => o !== obs));
          } else if (obs.type === "magnet") {
            // Magnet power-up
            setMagnetActive(true);
            setActivePowerUps(prev => [...prev, { type: "magnet", duration: 6000, startTime: Date.now() }]);
            createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "magnet", 8);
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
  }, [gameState, playSpikeSound, playCoinSound, saveScore]); // Removed generateObstacle to avoid circular dependency

  // Test canvas immediately on mount
  useEffect(() => {
    console.log("Component mounted, testing canvas...");
    const canvas = canvasRef.current;
    if (canvas) {
      console.log("Canvas found:", canvas.width, "x", canvas.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        console.log("Canvas context found");
        // Draw a test rectangle
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, 100, 100);
        console.log("Test rectangle drawn");
      } else {
        console.log("Canvas context NOT found");
      }
    } else {
      console.log("Canvas NOT found");
    }
  }, []);

  // Draw game - ALWAYS draw regardless of game state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("Canvas context not found");
      return;
    }

    console.log("Drawing game state:", gameState, "obstacles:", obstacles.length, "zuboY:", zuboY);

    // ALWAYS clear and draw - don't let game state prevent drawing
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Test canvas with a simple rectangle to ensure it's working
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(10, 10, 50, 50);
    
    // Draw a simple background that should always be visible
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw a simple ground
    ctx.fillStyle = "#8BC34A";
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
    
    // Draw a simple Zubo character
    ctx.fillStyle = "#FF6B9D";
    ctx.fillRect(100, zuboY, ZUBO_SIZE, ZUBO_SIZE);

    // Apply screen shake effect
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

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
      } else if (obs.type === "shield") {
        // Shield power-up
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = "#2E7D32";
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
        // Shield icon
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🛡️", obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
      } else if (obs.type === "speed") {
        // Speed power-up
        ctx.fillStyle = "#FF9800";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = "#F57C00";
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
        // Speed icon
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚡", obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
      } else if (obs.type === "magnet") {
        // Magnet power-up
        ctx.fillStyle = "#9C27B0";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = "#7B1FA2";
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
        // Magnet icon
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🧲", obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
      }
    });

    // Draw Zubo with enhanced 3D cartoon style
    const zuboX = 100;
    
    // Enhanced shadow with 3D effect
    const shadowGradient = ctx.createRadialGradient(
      zuboX + ZUBO_SIZE / 2, GAME_HEIGHT - 45, 0,
      zuboX + ZUBO_SIZE / 2, GAME_HEIGHT - 45, ZUBO_SIZE / 2 + 10
    );
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    shadowGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.1)");
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.ellipse(zuboX + ZUBO_SIZE / 2, GAME_HEIGHT - 45, ZUBO_SIZE / 2 + 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Zubo body with enhanced 3D effects
    if (zuboDesign.bodyType === "sphere") {
      // Enhanced 3D sphere gradient
      const bodyGradient = ctx.createRadialGradient(
        zuboX + ZUBO_SIZE / 2 - 15, zuboY + ZUBO_SIZE / 2 - 15, 0,
        zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2, ZUBO_SIZE / 2
      );
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 40));
      bodyGradient.addColorStop(0.3, lightenColor(zuboDesign.color, 20));
      bodyGradient.addColorStop(0.7, zuboDesign.color);
      bodyGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2, ZUBO_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Enhanced 3D outline with multiple strokes
      ctx.strokeStyle = darkenColor(zuboDesign.color, 40);
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.strokeStyle = darkenColor(zuboDesign.color, 20);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 3D highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(zuboX + ZUBO_SIZE / 2 - 8, zuboY + ZUBO_SIZE / 2 - 8, ZUBO_SIZE / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (zuboDesign.bodyType === "cube") {
      // Enhanced 3D cube with multiple faces
      // Main face
      const bodyGradient = ctx.createLinearGradient(zuboX, zuboY, zuboX, zuboY + ZUBO_SIZE);
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 30));
      bodyGradient.addColorStop(0.5, zuboDesign.color);
      bodyGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(zuboX, zuboY, ZUBO_SIZE, ZUBO_SIZE);
      
      // 3D top face
      ctx.fillStyle = lightenColor(zuboDesign.color, 40);
      ctx.beginPath();
      ctx.moveTo(zuboX, zuboY);
      ctx.lineTo(zuboX + 10, zuboY - 10);
      ctx.lineTo(zuboX + ZUBO_SIZE + 10, zuboY - 10);
      ctx.lineTo(zuboX + ZUBO_SIZE, zuboY);
      ctx.closePath();
      ctx.fill();
      
      // 3D right face
      ctx.fillStyle = darkenColor(zuboDesign.color, 30);
      ctx.beginPath();
      ctx.moveTo(zuboX + ZUBO_SIZE, zuboY);
      ctx.lineTo(zuboX + ZUBO_SIZE + 10, zuboY - 10);
      ctx.lineTo(zuboX + ZUBO_SIZE + 10, zuboY + ZUBO_SIZE - 10);
      ctx.lineTo(zuboX + ZUBO_SIZE, zuboY + ZUBO_SIZE);
      ctx.closePath();
      ctx.fill();
      
      // Enhanced outline
      ctx.strokeStyle = darkenColor(zuboDesign.color, 50);
      ctx.lineWidth = 3;
      ctx.strokeRect(zuboX, zuboY, ZUBO_SIZE, ZUBO_SIZE);
    } else {
      // Enhanced 3D tube
      const bodyGradient = ctx.createLinearGradient(zuboX + 10, zuboY, zuboX + 10, zuboY + ZUBO_SIZE);
      bodyGradient.addColorStop(0, lightenColor(zuboDesign.color, 30));
      bodyGradient.addColorStop(0.3, zuboDesign.color);
      bodyGradient.addColorStop(0.7, zuboDesign.color);
      bodyGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(zuboX + 10, zuboY, ZUBO_SIZE - 20, ZUBO_SIZE);
      
      // 3D tube highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(zuboX + 12, zuboY + 2, ZUBO_SIZE - 24, ZUBO_SIZE / 3);
      
      // 3D tube shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(zuboX + 10, zuboY + ZUBO_SIZE - 5, ZUBO_SIZE - 20, 5);
      
      // Enhanced outline
      ctx.strokeStyle = darkenColor(zuboDesign.color, 40);
      ctx.lineWidth = 3;
      ctx.strokeRect(zuboX + 10, zuboY, ZUBO_SIZE - 20, ZUBO_SIZE);
    }

    // Draw enhanced 3D eyes
    // Left eye
    const leftEyeGradient = ctx.createRadialGradient(
      zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 0,
      zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 6
    );
    leftEyeGradient.addColorStop(0, "#FFFFFF");
    leftEyeGradient.addColorStop(0.7, "#F0F0F0");
    leftEyeGradient.addColorStop(1, "#E0E0E0");
    
    ctx.fillStyle = leftEyeGradient;
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    const rightEyeGradient = ctx.createRadialGradient(
      zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 0,
      zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 6
    );
    rightEyeGradient.addColorStop(0, "#FFFFFF");
    rightEyeGradient.addColorStop(0.7, "#F0F0F0");
    rightEyeGradient.addColorStop(1, "#E0E0E0");
    
    ctx.fillStyle = rightEyeGradient;
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils with 3D effect
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 - 10, zuboY + ZUBO_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.arc(zuboX + ZUBO_SIZE / 2 + 10, zuboY + ZUBO_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2 - 8, zuboY + ZUBO_SIZE / 2 - 7, 1.5, 0, Math.PI * 2);
    ctx.arc(zuboX + ZUBO_SIZE / 2 + 12, zuboY + ZUBO_SIZE / 2 - 7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Enhanced 3D smile
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2 + 5, 12, 0, Math.PI);
    ctx.stroke();
    
    // Smile highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(zuboX + ZUBO_SIZE / 2, zuboY + ZUBO_SIZE / 2 + 3, 12, 0, Math.PI);
    ctx.stroke();

    // Draw particles
    particles.forEach(particle => {
      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        
        if (particle.type === "jump") {
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "coin") {
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "destruction") {
          ctx.fillStyle = "#FF4444";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "shield") {
          ctx.fillStyle = "#4CAF50";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "speed") {
          ctx.fillStyle = "#FF9800";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "magnet") {
          ctx.fillStyle = "#9C27B0";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    });

    // Draw enhanced 3D legs
    if (zuboDesign.legType === "springy") {
      // Left springy leg with 3D effect
      const leftLegGradient = ctx.createLinearGradient(
        zuboX + 10, zuboY + ZUBO_SIZE, 
        zuboX + 10, zuboY + ZUBO_SIZE + 15
      );
      leftLegGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      leftLegGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = leftLegGradient;
      ctx.fillRect(zuboX + 10, zuboY + ZUBO_SIZE, 10, 15);
      
      // Right springy leg with 3D effect
      const rightLegGradient = ctx.createLinearGradient(
        zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 
        zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE + 15
      );
      rightLegGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      rightLegGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = rightLegGradient;
      ctx.fillRect(zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 10, 15);
      
      // 3D leg highlights
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(zuboX + 11, zuboY + ZUBO_SIZE, 8, 3);
      ctx.fillRect(zuboX + ZUBO_SIZE - 19, zuboY + ZUBO_SIZE, 8, 3);
      
      // Enhanced outlines
      ctx.strokeStyle = darkenColor(zuboDesign.color, 40);
      ctx.lineWidth = 2;
      ctx.strokeRect(zuboX + 10, zuboY + ZUBO_SIZE, 10, 15);
      ctx.strokeRect(zuboX + ZUBO_SIZE - 20, zuboY + ZUBO_SIZE, 10, 15);
    } else {
      // Left normal leg with 3D effect
      const leftLegGradient = ctx.createLinearGradient(
        zuboX + 15, zuboY + ZUBO_SIZE, 
        zuboX + 15, zuboY + ZUBO_SIZE + 8
      );
      leftLegGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      leftLegGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = leftLegGradient;
      ctx.fillRect(zuboX + 15, zuboY + ZUBO_SIZE, 8, 8);
      
      // Right normal leg with 3D effect
      const rightLegGradient = ctx.createLinearGradient(
        zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE, 
        zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE + 8
      );
      rightLegGradient.addColorStop(0, lightenColor(zuboDesign.color, 20));
      rightLegGradient.addColorStop(1, darkenColor(zuboDesign.color, 20));
      
      ctx.fillStyle = rightLegGradient;
      ctx.fillRect(zuboX + ZUBO_SIZE - 23, zuboY + ZUBO_SIZE, 8, 8);
      
      // 3D leg highlights
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(zuboX + 16, zuboY + ZUBO_SIZE, 6, 2);
      ctx.fillRect(zuboX + ZUBO_SIZE - 22, zuboY + ZUBO_SIZE, 6, 2);
      
      // Enhanced outlines
      ctx.strokeStyle = darkenColor(zuboDesign.color, 40);
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
    
    // Restore canvas state after screen shake
    ctx.restore();
  }, [obstacles, zuboY, zuboDesign, screenShake, gameState, particles]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setCoins(3);
    setTimeElapsed(0);
    setZuboY(GAME_HEIGHT - ZUBO_SIZE - 50);
    setZuboVelocity(0);
    setObstacles([]);
    setScrollOffset(0);
    setCurrentLevel(1);
    setPerfectRun(true);
    setPowerLevel(1);
    setPowerPoints(0);
    setCanDoubleJump(false);
    setCanDestroyObstacles(false);
    setDoubleJumpUsed(false);
    setLastTapTime(0);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background py-2 md:py-8 px-2 md:px-6 landscape-mobile">
      <MobileNavigation />
      <div className="container mx-auto max-w-4xl ultra-wide">
        <div className="flex justify-between items-center mb-2 md:mb-6 gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-xs sm:text-sm md:text-base touch-target"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSettings(true)}
            className="text-xs sm:text-sm md:text-base touch-target"
            aria-label="Open game settings"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">⚙️</span>
          </Button>
        </div>

        <Card className="p-2 md:p-8 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl border-2 md:border-4">
          <div className="text-center mb-2 md:mb-6">
            <h1 className="text-lg sm:text-xl md:text-4xl font-black text-foreground mb-1 md:mb-2 drop-shadow-lg text-responsive">Zubo Jump</h1>
            <p className="text-xs md:text-base text-muted-foreground text-responsive">Tap or Press Space to Jump!</p>
          </div>

          <div className="grid grid-cols-2 md:flex md:justify-between mb-3 md:mb-4 gap-2 tablet-grid">
            <div className="text-center bg-primary/10 px-2 md:px-4 py-2 rounded-xl border-2 border-primary/20">
              <div className="text-lg md:text-2xl font-bold text-primary drop-shadow">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center bg-secondary/10 px-2 md:px-4 py-2 rounded-xl border-2 border-secondary/20">
              <div className="text-lg md:text-2xl font-bold text-secondary drop-shadow">{formatTime(timeElapsed)}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
            <div className="text-center bg-accent/10 px-2 md:px-4 py-2 rounded-xl border-2 border-accent/20">
              <div className="text-lg md:text-2xl font-bold text-accent drop-shadow">{highScore}</div>
              <div className="text-xs text-muted-foreground">High Score</div>
            </div>
            <div className="text-center bg-muted px-2 md:px-4 py-2 rounded-xl border-2 border-border">
              <div className="text-lg md:text-2xl font-bold">{"🎵".repeat(Math.max(0, coins))}</div>
              <div className="text-xs text-muted-foreground">Lives</div>
            </div>
          </div>

          {/* Level and Progress Display */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border-2 border-purple-200/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" 
                     style={{ backgroundColor: getCurrentLevelData().color }}>
                  {currentLevel}
                </div>
                <div>
                  <div className="font-bold text-sm">{getCurrentLevelData().name}</div>
                  <div className="text-xs text-muted-foreground">Level {currentLevel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">{totalCoins} 🪙</div>
                <div className="text-xs text-muted-foreground">Total Coins</div>
              </div>
            </div>
            
            {/* Progress to next level */}
            {getNextLevelData() && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    backgroundColor: getNextLevelData()?.color,
                    width: `${Math.min(100, (score / getNextLevelData()!.requiredScore) * 100)}%`
                  }}
                ></div>
              </div>
            )}
            
            {getNextLevelData() && (
              <div className="text-xs text-center text-muted-foreground">
                {getNextLevelData()!.requiredScore - score} points to {getNextLevelData()!.name}
              </div>
            )}
          </div>

          {/* Power Progression Display */}
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border-2 border-orange-200/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-sm">Power Level {powerLevel}</div>
                  <div className="text-xs text-muted-foreground">Jump Power: {Math.round(getPowerMultiplier() * 100)}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-600">{powerPoints} ⚡</div>
                <div className="text-xs text-muted-foreground">Power Points</div>
              </div>
            </div>
            
            {/* Abilities Display */}
            <div className="flex gap-2 justify-center">
              {canDoubleJump && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full text-xs">
                  <span>🦘</span>
                  <span>Double Jump</span>
                  {!doubleJumpUsed && <span className="text-green-500">●</span>}
                </div>
              )}
              {canDestroyObstacles && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full text-xs">
                  <span>💥</span>
                  <span>Destroy</span>
                </div>
              )}
            </div>
          </div>

          <div 
            ref={containerRef}
            className="relative bg-gradient-to-b from-accent/5 to-primary/5 rounded-xl md:rounded-2xl overflow-hidden mx-auto border-2 md:border-4 border-primary/20 shadow-2xl w-full game-container"
            style={{ 
              aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
              maxHeight: 'calc(100vh - 200px)',
              minHeight: '250px'
            }}
          >
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              onClick={jump}
              onTouchStart={(e) => {
                e.preventDefault();
                jump();
              }}
              onKeyDown={(e) => {
                if (e.code === "Space" || e.code === "Enter") {
                  e.preventDefault();
                  jump();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Game canvas - Press space or click to make Zubo jump"
              className="cursor-pointer w-full h-full touch-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 game-canvas-mobile"
              style={{
                width: '100%',
                height: '100%',
                touchAction: 'none',
                backgroundColor: '#87CEEB',
                display: 'block'
              }}
            />
            
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center animate-bounce-slow px-4">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">Ready to Jump?</h2>
                  <Button size="lg" onClick={startGame} className="shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center px-4">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">Paused</h2>
                  <Button size="lg" onClick={() => setGameState("playing")} className="shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                </div>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="text-center px-4">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg text-destructive">Game Over!</h2>
                  <p className="text-base md:text-xl mb-2">Final Score: <span className="font-bold text-primary">{score}</span></p>
                  <p className="text-sm md:text-lg mb-2">Level Reached: <span className="font-bold" style={{ color: getCurrentLevelData().color }}>{getCurrentLevelData().name}</span></p>
                  <p className="text-sm md:text-lg mb-2">Coins Collected: <span className="font-bold text-yellow-600">{totalCoins}</span></p>
                  <p className="text-sm md:text-lg mb-4">Time Survived: <span className="font-bold text-secondary">{formatTime(timeElapsed)}</span></p>
                  <Button size="lg" onClick={startGame} className="shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}

            {/* Level Up Notification */}
            {showLevelUp && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-bold">Level Up!</div>
                    <div className="text-sm">Welcome to {getCurrentLevelData().name}!</div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievement Notification */}
            {showAchievement && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{showAchievement.icon}</span>
                  <div>
                    <div className="font-bold">Achievement Unlocked!</div>
                    <div className="text-sm">{showAchievement.name}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Power Up Notification */}
            {showPowerUp && (
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-bold">Power Up!</div>
                    <div className="text-sm">Power Level {powerLevel} - Jump Higher!</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 md:mt-6 flex gap-4 justify-center">
            {gameState === "playing" && (
              <Button variant="outline" onClick={() => setGameState("paused")} className="shadow-md hover:shadow-lg transition-shadow border-2 text-sm md:text-base">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
          </div>

          <div className="mt-3 md:mt-6 text-center text-xs md:text-sm text-muted-foreground space-y-1 px-2">
            <p>🎮 Tap Screen / Press SPACE to jump</p>
            <p>🦘 Double-tap for double jump (unlock at Power Level 2)</p>
            <p>💥 Destroy spikes by jumping above them (unlock at Power Level 3)</p>
            <p>🎵 Collect golden Note Coins for extra lives!</p>
            <p>⚠️ Avoid red spikes! Jump on purple platforms!</p>
            <p>🏆 Level up by scoring points! Higher levels = harder challenges!</p>
            <p>⚡ Gain power as you score! Higher power = stronger jumps!</p>
            <p>⭐ Unlock achievements and collect rewards!</p>
          </div>
        </Card>
      </div>

      {/* Active Power-ups Display */}
      {activePowerUps.length > 0 && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border-2 border-accent/20">
          <div className="text-xs font-bold text-accent mb-2">Active Power-ups</div>
          <div className="flex flex-wrap gap-1">
            {activePowerUps.map((powerUp, index) => {
              const remainingTime = Math.max(0, powerUp.duration - (Date.now() - powerUp.startTime));
              const progress = remainingTime / powerUp.duration;
              return (
                <div key={index} className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded text-xs">
                  <span>
                    {powerUp.type === "shield" && "🛡️"}
                    {powerUp.type === "speed" && "⚡"}
                    {powerUp.type === "magnet" && "🧲"}
                  </span>
                  <div className="w-8 h-1 bg-gray-300 rounded">
                    <div 
                      className="h-full bg-accent rounded" 
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsComponent onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Game;
