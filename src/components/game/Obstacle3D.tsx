import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface Obstacle3DProps {
  position: [number, number, number];
  type: "platform" | "spike" | "coin";
  width: number;
  height: number;
}

export const Obstacle3D = ({ position, type, width, height }: Obstacle3DProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && type === "coin") {
      // Rotate coins
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.2;
    }
  });

  if (type === "spike") {
    return (
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <coneGeometry args={[width / 50, height / 50, 4]} />
        <meshToonMaterial color="#DC2626" />
      </mesh>
    );
  }

  if (type === "coin") {
    return (
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshToonMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.3}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          ♪
        </Text>
      </group>
    );
  }

  // Platform
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[width / 50, height / 50, 0.5]} />
      <meshToonMaterial color="#9b87f5" />
    </mesh>
  );
};
