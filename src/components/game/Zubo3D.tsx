import { useRef } from "react";
import { Mesh, Group } from "three";
import { useFrame } from "@react-three/fiber";

type BodyType = "sphere" | "cube" | "tube";
type LegType = "springy" | "short";

interface Zubo3DProps {
  position: [number, number, number];
  bodyType: BodyType;
  legType: LegType;
  color: string;
  isJumping: boolean;
}

export const Zubo3D = ({ position, bodyType, legType, color, isJumping }: Zubo3DProps) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (groupRef.current && !isJumping) {
      // Idle animation - slight bobbing
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    } else if (groupRef.current) {
      groupRef.current.position.y = position[1];
    }
    
    if (bodyRef.current) {
      // Slight rotation for personality
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const renderBody = () => {
    switch (bodyType) {
      case "sphere":
        return (
          <mesh ref={bodyRef} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshToonMaterial color={color} />
          </mesh>
        );
      case "cube":
        return (
          <mesh ref={bodyRef} castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshToonMaterial color={color} />
          </mesh>
        );
      case "tube":
        return (
          <mesh ref={bodyRef} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
            <meshToonMaterial color={color} />
          </mesh>
        );
    }
  };

  const renderLegs = () => {
    if (legType === "springy") {
      return (
        <>
          <mesh position={[-0.3, -0.7, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.5, 16]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.3, -0.7, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.5, 16]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      );
    } else {
      return (
        <>
          <mesh position={[-0.3, -0.6, 0]} castShadow>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.3, -0.6, 0]} castShadow>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      );
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {renderBody()}
      {renderLegs()}
      {/* Eyes */}
      <mesh position={[-0.2, 0.2, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshToonMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 0.2, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshToonMaterial color="#000000" />
      </mesh>
    </group>
  );
};
