import { Zubo3D } from "./Zubo3D";
import { Obstacle3D } from "./Obstacle3D";

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "platform" | "spike" | "coin";
};

interface Game3DSceneProps {
  zuboY: number;
  zuboDesign: {
    bodyType: BodyType;
    legType: LegType;
    color: string;
  };
  obstacles: Obstacle[];
  isJumping: boolean;
}

export const Game3DScene = ({ zuboY, zuboDesign, obstacles, isJumping }: Game3DSceneProps) => {
  // Convert 2D game coordinates to 3D
  const zuboX = -6; // Fixed X position for Zubo
  const zubo3DY = (zuboY - 200) / 50 - 3; // Convert to 3D Y coordinate

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#9b87f5" />

      {/* Zubo */}
      <Zubo3D
        position={[zuboX, zubo3DY, 0]}
        bodyType={zuboDesign.bodyType}
        legType={zuboDesign.legType}
        color={zuboDesign.color}
        isJumping={isJumping}
      />

      {/* Obstacles */}
      {obstacles.map((obs, index) => {
        const obs3DX = (obs.x - 400) / 50 - 6;
        const obs3DY = (obs.y - 200) / 50 - 3;
        
        return (
          <Obstacle3D
            key={index}
            position={[obs3DX, obs3DY, 0]}
            type={obs.type}
            width={obs.width}
            height={obs.height}
          />
        );
      })}

      {/* Ground */}
      <mesh position={[0, -6, 0]} receiveShadow>
        <boxGeometry args={[50, 1, 5]} />
        <meshToonMaterial color="#403E43" />
      </mesh>

      {/* Background */}
      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[50, 20]} />
        <meshToonMaterial color="#1A1F2C" />
      </mesh>
    </>
  );
};
