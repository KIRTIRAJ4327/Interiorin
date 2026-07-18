"use client";

import { ContactShadows, Edges, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Minus, Plus, RotateCcw, RotateCw, Rows3 } from "lucide-react";
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import type { SpatialScene, Vector3 } from "@/lib/spatial/schema";

type SceneCanvasProps = {
  scene: SpatialScene;
  previewPosition?: Vector3;
  forceFailure?: boolean;
};

type CameraPosition = [number, number, number];
const cameraTarget: CameraPosition = [2.6, 0.75, 2];
const initialCamera: CameraPosition = [4.8, 4.2, 6.8];

function Table({ position, dimensions, ghost = false }: { position: Vector3; dimensions: { width: number; height: number; depth: number }; ghost?: boolean }) {
  const color = ghost ? "#2f596a" : "#8a6e52";
  const opacity = ghost ? 0.28 : 1;
  const insetX = dimensions.width / 2 - 0.16;
  const insetZ = dimensions.depth / 2 - 0.14;
  const legs: Array<[number, number, number]> = [
    [-insetX, dimensions.height / 2, -insetZ],
    [insetX, dimensions.height / 2, -insetZ],
    [-insetX, dimensions.height / 2, insetZ],
    [insetX, dimensions.height / 2, insetZ],
  ];

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, dimensions.height - 0.06, 0]} castShadow={!ghost}>
        <boxGeometry args={[dimensions.width, 0.12, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0} transparent={ghost} opacity={opacity} />
        <Edges color="#2f596a" lineWidth={3} />
      </mesh>
      {legs.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow={!ghost}>
          <boxGeometry args={[0.08, dimensions.height - 0.12, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.78} metalness={0} transparent={ghost} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Bookcase({ position, dimensions }: { position: Vector3; dimensions: { width: number; height: number; depth: number } }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, dimensions.height / 2, 0]} castShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color="#6f5b47" roughness={0.84} metalness={0} />
        <Edges color="#202923" lineWidth={1} />
      </mesh>
      {[0.36, 0.76, 1.16, 1.56].map((height) => (
        <mesh key={height} position={[0, height, dimensions.depth / 2 + 0.01]}>
          <boxGeometry args={[dimensions.width - 0.1, 0.04, dimensions.depth + 0.04]} />
          <meshStandardMaterial color="#59483b" roughness={0.84} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function CameraSync({ position }: { position: CameraPosition }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...cameraTarget);
    camera.updateProjectionMatrix();
  }, [camera, position]);
  return null;
}

function Room({ scene, previewPosition, cameraPosition }: SceneCanvasProps & { cameraPosition: CameraPosition }) {
  const table = scene.objects.find((object) => object.id === "table");
  const bookcase = scene.objects.find((object) => object.id === "bookcase");
  if (!table || !bookcase) throw new Error("Prepared scene objects are incomplete.");

  return (
    <>
      <CameraSync position={cameraPosition} />
      <color attach="background" args={["#e8e0d3"]} />
      <hemisphereLight intensity={0.9} />
      <directionalLight position={[4, 7, 5]} intensity={1.6} castShadow />
      <mesh position={[2.6, 0, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 4]} />
        <meshStandardMaterial color="#e8e0d3" roughness={1} />
        <Edges color="#202923" lineWidth={1} />
      </mesh>
      <mesh position={[2.6, 1.35, 0]} receiveShadow>
        <boxGeometry args={[5.2, 2.7, 0.04]} />
        <meshStandardMaterial color="#fbfaf6" roughness={1} />
        <Edges color="#202923" lineWidth={1} />
      </mesh>
      <mesh position={[0, 1.35, 2]} receiveShadow>
        <boxGeometry args={[0.04, 2.7, 4]} />
        <meshStandardMaterial color="#fbfaf6" roughness={1} />
        <Edges color="#202923" lineWidth={1} />
      </mesh>
      <Table position={table.transform.position} dimensions={table.dimensions} />
      {previewPosition && previewPosition.x !== table.transform.position.x ? (
        <Table position={previewPosition} dimensions={table.dimensions} ghost />
      ) : null}
      <Bookcase position={bookcase.transform.position} dimensions={bookcase.dimensions} />
      <ContactShadows position={[2.6, 0.025, 2]} opacity={0.12} scale={7} blur={2.2} far={5} />
      <OrbitControls
        makeDefault
        target={cameraTarget}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={(35 * Math.PI) / 180}
        maxPolarAngle={(78 * Math.PI) / 180}
        minAzimuthAngle={(-55 * Math.PI) / 180}
        maxAzimuthAngle={(55 * Math.PI) / 180}
        minDistance={5.2}
        maxDistance={8.8}
      />
    </>
  );
}

export function SceneCanvas(props: SceneCanvasProps) {
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(initialCamera);
  const [semanticOpen, setSemanticOpen] = useState(false);
  const table = props.scene.objects.find((object) => object.id === "table");
  const bookcase = props.scene.objects.find((object) => object.id === "bookcase");
  const path = props.scene.constraints.find((constraint) => constraint.id === "path-clearance");
  const floor = props.scene.zones.find((zone) => zone.kind === "floor");
  const wall = props.scene.zones.find((zone) => zone.kind === "wall");

  const roomWidth = floor ? Math.max(...floor.polygon.map((point) => point.x)) - Math.min(...floor.polygon.map((point) => point.x)) : undefined;
  const roomDepth = floor ? Math.max(...floor.polygon.map((point) => point.z)) - Math.min(...floor.polygon.map((point) => point.z)) : undefined;
  const roomHeight = wall ? Math.max(...wall.polygon.map((point) => point.y)) - Math.min(...wall.polygon.map((point) => point.y)) : undefined;

  function rotate() {
    setCameraPosition(([x, y, z]) => {
      const dx = x - cameraTarget[0];
      const dz = z - cameraTarget[2];
      const angle = (5 * Math.PI) / 180;
      return [cameraTarget[0] + dx * Math.cos(angle) - dz * Math.sin(angle), y, cameraTarget[2] + dx * Math.sin(angle) + dz * Math.cos(angle)];
    });
  }

  function zoom(scale: number) {
    setCameraPosition(([x, y, z]) => [
      cameraTarget[0] + (x - cameraTarget[0]) * scale,
      cameraTarget[1] + (y - cameraTarget[1]) * scale,
      cameraTarget[2] + (z - cameraTarget[2]) * scale,
    ]);
  }

  return (
    <div className="scene-canvas" aria-label="Interactive three-dimensional view of the prepared dining room">
      <div className="canvas-controls" aria-label="3D view controls">
        <button type="button" onClick={rotate} aria-label="Rotate view"><RotateCw aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => zoom(0.9)} aria-label="Zoom in"><Plus aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => zoom(1.1)} aria-label="Zoom out"><Minus aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => setCameraPosition(initialCamera)} aria-label="Reset view"><RotateCcw aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => setSemanticOpen((open) => !open)} aria-expanded={semanticOpen} aria-label="Open semantic scene"><Rows3 aria-hidden="true" size={18} /></button>
      </div>
      <SceneErrorBoundary>
        {props.forceFailure ? <ForcedSceneFailure /> : (
          <Canvas shadows camera={{ position: initialCamera, fov: 38, near: 0.1, far: 50 }} dpr={[1, 1.5]} fallback={<CanvasFallback />}>
            <Room {...props} cameraPosition={cameraPosition} />
          </Canvas>
        )}
      </SceneErrorBoundary>
      {semanticOpen ? (
        <dl className="canvas-semantic">
          <div><dt>Prepared room</dt><dd>{formatDimensions(roomWidth, roomDepth, roomHeight)}</dd></div>
          <div><dt>Dining table</dt><dd>{formatObject(table)}</dd></div>
          <div><dt>Heirloom bookcase</dt><dd>{formatObject(bookcase)}</dd></div>
          <div><dt>Required path</dt><dd>{path?.thresholdMeters ? `${formatMillimeters(path.thresholdMeters)} edge clearance` : "Not available"}</dd></div>
        </dl>
      ) : null}
      <p className="canvas-help">User-controlled view · pan and auto-orbit disabled</p>
    </div>
  );
}

function ForcedSceneFailure(): ReactNode {
  throw new Error("Forced Canvas failure for resilience verification.");
}

function formatMillimeters(meters: number) {
  return `${Math.round(meters * 1000).toLocaleString("en-US")} mm`;
}

function formatDimensions(width?: number, depth?: number, height?: number) {
  if (width === undefined || depth === undefined || height === undefined) return "Not available";
  return `${formatMillimeters(width)} × ${formatMillimeters(depth)} × ${formatMillimeters(height)}`;
}

function formatObject(object: SpatialScene["objects"][number] | undefined) {
  if (!object) return "Not available";
  const { width, depth, height } = object.dimensions;
  return `${formatDimensions(width, depth, height)} · centre x ${formatMillimeters(object.transform.position.x)}`;
}

function CanvasFallback() {
  return (
    <div className="canvas-fallback" role="img" aria-label="Semantic fallback for the prepared dining room">
      <strong>3D view unavailable. Continue with the complete semantic proof.</strong>
      <span>Prepared geometry and the decision controls remain available outside this view.</span>
    </div>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D scene failed; semantic proof remains available.", error, info.componentStack);
  }

  render() {
    return this.state.failed ? <CanvasFallback /> : this.props.children;
  }
}
