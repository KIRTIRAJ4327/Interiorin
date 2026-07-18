"use client";

import { ContactShadows, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { SpatialScene, Vector3 } from "@/lib/spatial/schema";

type SceneCanvasProps = {
  scene: SpatialScene;
  previewPosition?: Vector3;
};

function Table({ position, ghost = false }: { position: Vector3; ghost?: boolean }) {
  const color = ghost ? "#a9523b" : "#9a6a42";
  const opacity = ghost ? 0.35 : 1;
  const legs: Array<[number, number, number]> = [
    [-0.55, 0.36, -0.3],
    [0.55, 0.36, -0.3],
    [-0.55, 0.36, 0.3],
    [0.55, 0.36, 0.3],
  ];

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 0.73, 0]} castShadow={!ghost}>
        <boxGeometry args={[1.4, 0.12, 0.9]} />
        <meshStandardMaterial color={color} transparent={ghost} opacity={opacity} />
      </mesh>
      {legs.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow={!ghost}>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshStandardMaterial color={color} transparent={ghost} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Bookcase() {
  return (
    <group position={[2, 0, 0]}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 0.4]} />
        <meshStandardMaterial color="#674b36" />
      </mesh>
      {[0.38, 0.82, 1.26, 1.7].map((height) => (
        <mesh key={height} position={[0, height, 0.22]}>
          <boxGeometry args={[0.9, 0.045, 0.44]} />
          <meshStandardMaterial color="#3f3027" />
        </mesh>
      ))}
    </group>
  );
}

function Room({ scene, previewPosition }: SceneCanvasProps) {
  const table = scene.objects.find((object) => object.id === "table");
  const tablePosition = table?.transform.position ?? { x: 0.92, y: 0, z: 0 };

  return (
    <>
      <color attach="background" args={["#e8e0d3"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[-2, 6, 4]} intensity={2.2} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4.5]} />
        <meshStandardMaterial color="#c6aa80" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, -2.25]} receiveShadow>
        <boxGeometry args={[6, 2.7, 0.08]} />
        <meshStandardMaterial color="#eee9df" roughness={1} />
      </mesh>
      <mesh position={[2.55, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 4.2]} />
        <meshBasicMaterial color="#345b6b" transparent opacity={0.14} />
      </mesh>
      <Grid position={[0, 0.018, 0]} args={[6, 4.5]} cellColor="#7e7569" sectionColor="#345b6b" cellSize={0.25} sectionSize={1} fadeDistance={12} infiniteGrid={false} />
      <Table position={tablePosition} />
      {previewPosition && previewPosition.x !== tablePosition.x ? <Table position={previewPosition} ghost /> : null}
      <Bookcase />
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#f4eee2" emissive="#d8b66e" emissiveIntensity={0.5} />
      </mesh>
      <ContactShadows position={[0, 0.025, 0]} opacity={0.35} scale={8} blur={2.2} far={5} />
      <OrbitControls makeDefault enablePan={false} minDistance={4.5} maxDistance={9} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export function SceneCanvas(props: SceneCanvasProps) {
  return (
    <div className="scene-canvas" aria-label="Interactive three-dimensional view of the prepared dining room">
      <Canvas shadows camera={{ position: [4.6, 3.8, 5.8], fov: 38 }} dpr={[1, 1.5]}>
        <Room {...props} />
      </Canvas>
      <p className="canvas-help">Drag to orbit · Scroll to inspect scale</p>
    </div>
  );
}
