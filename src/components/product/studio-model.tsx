"use client";

import { ContactShadows, Edges, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, MousePointer2, Plus, RotateCcw, RotateCw, Rows3, X } from "lucide-react";
import { Component, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from "react";
import type { SceneAction, SceneObject, SpatialScene } from "@/lib/spatial/schema";

type CameraPosition = [number, number, number];

const objectColors: Record<SceneObject["category"], string> = {
  seating: "#8a6e52",
  table: "#6f5b47",
  storage: "#59675f",
  lighting: "#c3a66d",
  decor: "#7a5810",
  appliance: "#5a625c",
  plant: "#60754f",
  tree: "#49623f",
  hardscape: "#857d70",
  structure: "#6f665b",
};

function SceneObjectMesh({ object, selected, onSelect }: { object: SceneObject; selected: boolean; onSelect: (objectId: string) => void }) {
  const { width, height, depth } = object.dimensions;
  const position: [number, number, number] = [object.transform.position.x, 0, object.transform.position.z];

  if (object.category === "tree") {
    return (
      <group position={position} rotation={[0, object.transform.rotation.y, 0]} onClick={(event) => { event.stopPropagation(); onSelect(object.id); }}>
        <mesh position={[0, Math.min(1.2, height * 0.32), 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, Math.min(2.2, height * 0.64), 16]} />
          <meshStandardMaterial color="#6f5b47" roughness={1} />
        </mesh>
        <mesh position={[0, Math.min(height * 0.72, 2.6), 0]} castShadow>
          <sphereGeometry args={[Math.max(0.55, width / 2), 20, 16]} />
          <meshStandardMaterial color={objectColors.tree} roughness={1} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[position[0], height / 2, position[2]]} rotation={[0, object.transform.rotation.y, 0]} castShadow onClick={(event) => { event.stopPropagation(); onSelect(object.id); }}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={objectColors[object.category]} roughness={0.82} metalness={0} />
      <Edges color={selected ? "#d18b45" : object.protected ? "#9b4835" : "#2f596a"} lineWidth={selected || object.protected ? 2 : 1} />
    </mesh>
  );
}

function CameraSync({ position, target }: { position: CameraPosition; target: CameraPosition }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, position, target]);
  return null;
}

function Model({ scene, cameraPosition, target, width, depth, height, selectedObjectId, onSelectObject }: {
  scene: SpatialScene;
  cameraPosition: CameraPosition;
  target: CameraPosition;
  width: number;
  depth: number;
  height: number;
  selectedObjectId: string;
  onSelectObject: (objectId: string) => void;
}) {
  const environment = scene.environment ?? { warmth: "neutral" as const, intensity: "normal" as const };
  const background = environment.warmth === "warm" ? "#ead8c0" : environment.warmth === "cool" ? "#d9e3e5" : scene.kind === "interior" ? "#e8e0d3" : "#dfe3d5";
  const lightIntensity = environment.intensity === "bright" ? 1.85 : environment.intensity === "dim" ? 0.72 : 1.45;
  return (
    <>
      <CameraSync position={cameraPosition} target={target} />
      <color attach="background" args={[background]} />
      <hemisphereLight intensity={environment.intensity === "dim" ? 0.45 : 0.95} color={environment.warmth === "warm" ? "#ffd8ae" : environment.warmth === "cool" ? "#d9efff" : "#ffffff"} />
      <directionalLight position={[width * 0.75, Math.max(6, height * 2), depth * 0.85]} intensity={lightIntensity} color={environment.warmth === "warm" ? "#ffcf9f" : environment.warmth === "cool" ? "#d8edff" : "#ffffff"} castShadow />
      <mesh position={[width / 2, 0, depth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={scene.kind === "interior" ? "#e8e0d3" : "#b9b69d"} roughness={1} />
        <Edges color="#4d554f" lineWidth={1} />
      </mesh>
      {scene.kind === "interior" ? (
        <>
          <mesh position={[width / 2, height / 2, 0]} receiveShadow>
            <boxGeometry args={[width, height, 0.04]} />
            <meshStandardMaterial color="#fbfaf6" roughness={1} />
            <Edges color="#4d554f" lineWidth={1} />
          </mesh>
          <mesh position={[0, height / 2, depth / 2]} receiveShadow>
            <boxGeometry args={[0.04, height, depth]} />
            <meshStandardMaterial color="#fbfaf6" roughness={1} />
            <Edges color="#4d554f" lineWidth={1} />
          </mesh>
        </>
      ) : null}
      {scene.objects.map((object) => <SceneObjectMesh key={object.id} object={object} selected={object.id === selectedObjectId} onSelect={onSelectObject} />)}
      <ContactShadows position={[width / 2, 0.025, depth / 2]} opacity={0.14} scale={Math.max(width, depth) * 1.15} blur={2.4} far={Math.max(5, height * 2)} />
      <OrbitControls makeDefault target={target} enablePan={false} autoRotate={false} minPolarAngle={0.45} maxPolarAngle={1.42} minDistance={Math.max(4, Math.min(width, depth) * 0.8)} maxDistance={Math.max(width, depth) * 2.5} />
    </>
  );
}

export function StudioModel({ scene, onDirectAction }: { scene: SpatialScene; onDirectAction?: (action: SceneAction, summary: string) => void }) {
  const [semanticOpen, setSemanticOpen] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState("");
  const bounds = useMemo(() => {
    const points = scene.zones.flatMap((zone) => zone.polygon);
    const xs = points.map((point) => point.x);
    const zs = points.map((point) => point.z);
    const ys = points.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const depth = Math.max(...zs) - Math.min(...zs);
    const height = Math.max(2.7, Math.max(...ys) - Math.min(...ys));
    return { width, depth, height };
  }, [scene]);
  const target = useMemo<CameraPosition>(() => [bounds.width / 2, Math.min(1.1, bounds.height * 0.3), bounds.depth / 2], [bounds]);
  const initialCamera = useMemo<CameraPosition>(() => [bounds.width * 1.05, Math.max(4.2, bounds.height * 1.45), bounds.depth * 1.45], [bounds]);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(initialCamera);
  const selectedObject = scene.objects.find((object) => object.id === selectedObjectId);

  function rotate() {
    setCameraPosition(([x, y, z]) => {
      const dx = x - target[0];
      const dz = z - target[2];
      const angle = (8 * Math.PI) / 180;
      return [target[0] + dx * Math.cos(angle) - dz * Math.sin(angle), y, target[2] + dx * Math.sin(angle) + dz * Math.cos(angle)];
    });
  }

  function zoom(scale: number) {
    setCameraPosition(([x, y, z]) => [
      target[0] + (x - target[0]) * scale,
      target[1] + (y - target[1]) * scale,
      target[2] + (z - target[2]) * scale,
    ]);
  }

  function nudge(deltaX: number, deltaZ: number, label: string) {
    if (!selectedObject || !onDirectAction) return;
    onDirectAction({
      type: "move_object",
      objectId: selectedObject.id,
      position: { ...selectedObject.transform.position, x: selectedObject.transform.position.x + deltaX, z: selectedObject.transform.position.z + deltaZ },
    }, `3D control · move ${selectedObject.label} ${label} 100 mm.`);
  }

  function rotateObject(degrees: number) {
    if (!selectedObject || !onDirectAction) return;
    onDirectAction({ type: "rotate_object", objectId: selectedObject.id, rotationY: selectedObject.transform.rotation.y + degrees * Math.PI / 180 }, `3D control · rotate ${selectedObject.label} ${degrees > 0 ? "left" : "right"} ${Math.abs(degrees)} degrees.`);
  }

  return (
    <div className="product-model" aria-label={`Interactive 3D model of ${scene.name}`}>
      <div className="product-model-controls" aria-label="3D view controls">
        <button type="button" onClick={rotate} aria-label="Rotate model"><RotateCw aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => zoom(0.88)} aria-label="Zoom model in"><Plus aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => zoom(1.12)} aria-label="Zoom model out"><Minus aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => setCameraPosition(initialCamera)} aria-label="Reset model view"><RotateCcw aria-hidden="true" size={18} /></button>
        <button type="button" onClick={() => setSemanticOpen((current) => !current)} aria-expanded={semanticOpen} aria-label="Open model facts"><Rows3 aria-hidden="true" size={18} /></button>
      </div>
      <ProductModelBoundary scene={scene}>
        <Canvas role="img" aria-label={`User-controlled 3D ${scene.kind} model for ${scene.name}`} shadows camera={{ position: initialCamera, fov: 40, near: 0.1, far: 120 }} dpr={[1, 1.5]} onPointerMissed={() => setSelectedObjectId("")}>
          <Model scene={scene} cameraPosition={cameraPosition} target={target} selectedObjectId={selectedObjectId} onSelectObject={setSelectedObjectId} {...bounds} />
        </Canvas>
      </ProductModelBoundary>
      {onDirectAction ? <div className="product-object-editor" aria-label="Direct 3D object controls">
        <div className="object-editor-heading"><span><MousePointer2 aria-hidden="true" size={16} />Checked object edit</span>{selectedObject ? <button type="button" onClick={() => setSelectedObjectId("")} aria-label="Clear object selection"><X aria-hidden="true" size={16} /></button> : null}</div>
        <label>Select object<select value={selectedObjectId} onChange={(event) => setSelectedObjectId(event.target.value)}><option value="">Choose from model</option>{scene.objects.map((object) => <option key={object.id} value={object.id}>{object.label}{object.protected ? " · protected" : ""}</option>)}</select></label>
        {selectedObject ? <>
          <p><strong>{selectedObject.label}</strong><span>x {selectedObject.transform.position.x.toFixed(2)} · z {selectedObject.transform.position.z.toFixed(2)} m · {Math.round(selectedObject.transform.rotation.y * 180 / Math.PI)}°</span></p>
          {selectedObject.protected ? <small>Protected source object. Unlock it through a checked command before moving or rotating.</small> : <div className="object-editor-grid">
            <button type="button" onClick={() => nudge(-0.1, 0, "left")} aria-label={`Move ${selectedObject.label} left 100 millimetres`}><ArrowLeft aria-hidden="true" size={18} /></button>
            <button type="button" onClick={() => nudge(0, -0.1, "back")} aria-label={`Move ${selectedObject.label} back 100 millimetres`}><ArrowDown aria-hidden="true" size={18} /></button>
            <button type="button" onClick={() => nudge(0, 0.1, "forward")} aria-label={`Move ${selectedObject.label} forward 100 millimetres`}><ArrowUp aria-hidden="true" size={18} /></button>
            <button type="button" onClick={() => nudge(0.1, 0, "right")} aria-label={`Move ${selectedObject.label} right 100 millimetres`}><ArrowRight aria-hidden="true" size={18} /></button>
            <button type="button" onClick={() => rotateObject(15)} aria-label={`Rotate ${selectedObject.label} left 15 degrees`}><RotateCcw aria-hidden="true" size={18} /><span>15°</span></button>
            <button type="button" onClick={() => rotateObject(-15)} aria-label={`Rotate ${selectedObject.label} right 15 degrees`}><RotateCw aria-hidden="true" size={18} /><span>15°</span></button>
          </div>}
        </> : <small>Select an object in the model or list. Each nudge is validated and recorded before canonical mutation.</small>}
      </div> : null}
      {semanticOpen ? <SceneFacts scene={scene} bounds={bounds} /> : null}
      <p className="product-model-help">User-controlled view · semantic facts remain available · no survey claim</p>
    </div>
  );
}

function SceneFacts({ scene, bounds }: { scene: SpatialScene; bounds: { width: number; depth: number; height: number } }) {
  return (
    <div className="product-model-facts">
      <p><strong>Entered envelope</strong> {bounds.width.toFixed(2)} × {bounds.depth.toFixed(2)} × {bounds.height.toFixed(2)} m</p>
      <p><strong>Lighting hypothesis</strong> {scene.environment?.warmth ?? "neutral"} · {scene.environment?.intensity ?? "normal"}</p>
      {scene.openings.length ? <p><strong>Observed openings</strong> {scene.openings.map((opening) => `${opening.label} (${opening.provenance.confidence})`).join(", ")}</p> : null}
      <ul>{scene.objects.map((object) => <li key={object.id}><strong>{object.label}</strong><span>{object.dimensions.width.toFixed(2)} × {object.dimensions.depth.toFixed(2)} m · x {object.transform.position.x.toFixed(2)} · z {object.transform.position.z.toFixed(2)} · {object.provenance.authority.replaceAll("_", " ")}</span></li>)}</ul>
    </div>
  );
}

function ModelFallback({ scene }: { scene: SpatialScene }) {
  return <div className="product-model-fallback" role="img" aria-label={`Semantic fallback for ${scene.name}`}><strong>3D view unavailable.</strong><span>The entered dimensions, objects, options, actions, versions, and handoff remain usable below.</span></div>;
}

class ProductModelBoundary extends Component<{ children: ReactNode; scene: SpatialScene }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Studio 3D failed; semantic product flow remains available.", error, info.componentStack); }
  render() { return this.state.failed ? <ModelFallback scene={this.props.scene} /> : this.props.children; }
}
