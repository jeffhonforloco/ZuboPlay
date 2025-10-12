import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, Volume2, VolumeX, Music } from "lucide-react";

interface SettingsProps {
  onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [musicVolume, setMusicVolume] = useState([50]);
  
  // Enhanced settings
  const [doubleTapEnabled, setDoubleTapEnabled] = useState(true);
  const [powerModeEnabled, setPowerModeEnabled] = useState(true);
  const [obstacleDestruction, setObstacleDestruction] = useState(true);
  const [autoJump, setAutoJump] = useState(false);
  const [difficulty, setDifficulty] = useState("normal");
  const [visualEffects, setVisualEffects] = useState(true);
  const [particleEffects, setParticleEffects] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-background border-2 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Game Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sound Effects
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Sound Effects</span>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                aria-label="Toggle sound effects"
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Sound Volume: {soundVolume[0]}%
                </label>
                <Slider
                  value={soundVolume}
                  onValueChange={setSoundVolume}
                  max={100}
                  step={1}
                  className="w-full"
                  aria-label="Sound volume"
                />
              </div>
            )}
          </div>

          {/* Music Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Background Music</span>
              <Switch
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
                aria-label="Toggle background music"
              />
            </div>

            {musicEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Music Volume: {musicVolume[0]}%
                </label>
                <Slider
                  value={musicVolume}
                  onValueChange={setMusicVolume}
                  max={100}
                  step={1}
                  className="w-full"
                  aria-label="Music volume"
                />
              </div>
            )}
          </div>

          {/* Enhanced Game Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Controls</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Double-Tap Jump</span>
                <Switch
                  checked={doubleTapEnabled}
                  onCheckedChange={setDoubleTapEnabled}
                  aria-label="Toggle double-tap jump"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Power Progression</span>
                <Switch
                  checked={powerModeEnabled}
                  onCheckedChange={setPowerModeEnabled}
                  aria-label="Toggle power progression"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Obstacle Destruction</span>
                <Switch
                  checked={obstacleDestruction}
                  onCheckedChange={setObstacleDestruction}
                  aria-label="Toggle obstacle destruction"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Jump (Easy Mode)</span>
                <Switch
                  checked={autoJump}
                  onCheckedChange={setAutoJump}
                  aria-label="Toggle auto jump"
                />
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visual Effects</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visual Effects</span>
                <Switch
                  checked={visualEffects}
                  onCheckedChange={setVisualEffects}
                  aria-label="Toggle visual effects"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Particle Effects</span>
                <Switch
                  checked={particleEffects}
                  onCheckedChange={setParticleEffects}
                  aria-label="Toggle particle effects"
                />
              </div>
            </div>
          </div>

          {/* Difficulty Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Difficulty</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Game Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
