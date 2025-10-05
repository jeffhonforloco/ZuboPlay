import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Music2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const notes = [261.63, 293.66, 329.63, 349.23, 392.00]; // C, D, E, F, G

export const RhythmDemo = () => {
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  
  const playNote = useCallback((frequency: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  const handleNoteClick = useCallback((index: number) => {
    playNote(notes[index]);
    
    if (activeNotes.includes(index)) {
      // Hit!
      setScore(prev => prev + 100 + (combo * 10));
      setCombo(prev => prev + 1);
      setHits(prev => prev + 1);
      setTotal(prev => prev + 1);
      
      if (combo > 0 && combo % 10 === 0) {
        toast({
          title: `${combo} Combo!`,
          description: "You're on fire! 🔥",
        });
      }
    } else {
      // Miss
      setCombo(0);
      setTotal(prev => prev + 1);
    }
  }, [activeNotes, combo, playNote, toast]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNote = Math.floor(Math.random() * 5);
      setActiveNotes([randomNote]);
      setTimeout(() => setActiveNotes([]), 300);
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Jump to the Beat
          </h2>
          <p className="text-xl text-muted-foreground">
            Tap in rhythm to guide your Zubo through musical worlds
          </p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Music2 className="w-8 h-8 text-accent animate-pulse" />
            <div className="text-2xl font-bold">Melody Fields</div>
            <Music2 className="w-8 h-8 text-accent animate-pulse" />
          </div>

          {/* Rhythm Track */}
          <div className="relative h-48 bg-muted/30 rounded-xl overflow-hidden">
            {/* Background lines */}
            <div className="absolute inset-0 flex">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-l border-border/30"
                />
              ))}
            </div>

            {/* Moving notes */}
            <div className="absolute inset-0 flex items-center">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleNoteClick(i)}
                  className="flex-1 flex justify-center items-center cursor-pointer hover:bg-accent/5 transition-colors relative"
                >
                  {activeNotes.includes(i) && (
                    <div className="absolute w-16 h-16 bg-accent rounded-full animate-ping" />
                  )}
                  <div 
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      activeNotes.includes(i)
                        ? "bg-accent border-accent/50 scale-125"
                        : "bg-background border-accent/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Jump indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="text-sm font-bold bg-foreground text-background px-6 py-2 rounded-full">
                TAP TO JUMP
              </div>
            </div>
          </div>

          {/* Gameplay stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <div className="text-3xl font-black text-primary">{score.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-xl">
              <div className="text-3xl font-black text-accent">{combo}</div>
              <div className="text-sm text-muted-foreground">Combo</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-xl">
              <div className="text-3xl font-black text-secondary-foreground">
                {total > 0 ? Math.round((hits / total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
