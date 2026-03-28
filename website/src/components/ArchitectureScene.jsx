import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import './ArchitectureScene.css';
const NODES = [
  { id: 'meet',       label: 'Google Meet',     sub: 'meet.google.com',    pos: [-4, 1, 0],  color: '#4285f4', emoji: '🎙️' },
  { id: 'speech',     label: 'Web Speech API',  sub: 'Chrome Built-in ASR', pos: [-1.5, 2.5, 0], color: '#bb86fc', emoji: '🔊' },
  { id: 'content',    label: 'Content Script',  sub: 'content.js MV3',     pos: [-1.5, -0.5, 0], color: '#bb86fc', emoji: '🧩' },
  { id: 'bg',         label: 'Service Worker',  sub: 'background.js',       pos: [1.5, 1, 0],  color: '#ce9dfd', emoji: '⚙️' },
  { id: 'fastapi',    label: 'FastAPI',          sub: 'localhost:8000',      pos: [4, 2, 0],   color: '#009688', emoji: '⚡' },
  { id: 'mongo',      label: 'MongoDB',          sub: 'Transcripts + Sessions',pos: [4, -0.5, 0], color: '#4caf50', emoji: '🍃' },
  { id: 'bart',       label: 'BART Model',       sub: 'Fine-tuned on AMI', pos: [7, 1, 0],   color: '#f59e0b', emoji: '🤖' },
  { id: 'output',     label: 'Structured Output',sub: 'TL;DR · Actions · Decisions', pos: [10, 1, 0], color: '#03dac6', emoji: '✨' },
];
const EDGES = [
  ['meet', 'speech'],
  ['meet', 'content'],
  ['speech', 'bg'],
  ['content', 'bg'],
  ['bg', 'fastapi'],
  ['fastapi', 'mongo'],
  ['mongo', 'bart'],
  ['bart', 'output'],
];
function getNode(id) { return NODES.find(n => n.id === id); }
function Node({ node, hovered, onHover }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = node.pos[1] + Math.sin(state.clock.elapsedTime * 0.8 + node.pos[0]) * 0.12;
    }
  });
  const col = new THREE.Color(node.color);
  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered === node.id ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {}
      {hovered === node.id && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.4} />
        </mesh>
      )}
      {}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.65, 0]}
          fontSize={0.22}
          color="#f0f0ff"
          anchorX="center"
          anchorY="middle"
          font="https:
        >
          {node.emoji} {node.label}
        </Text>
        <Text
          position={[0, 0.38, 0]}
          fontSize={0.14}
          color="#a0a0b4"
          anchorX="center"
          anchorY="middle"
        >
          {node.sub}
        </Text>
      </Billboard>
    </group>
  );
}
function Edge({ from, to }) {
  const fromNode = getNode(from);
  const toNode = getNode(to);
  const start = new THREE.Vector3(...fromNode.pos);
  const end = new THREE.Vector3(...toNode.pos);
  const progress = useRef(0);
  const beadRef = useRef();
  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.4) % 1;
    if (beadRef.current) {
      beadRef.current.position.lerpVectors(start, end, progress.current);
    }
  });
  return (
    <>
      <Line
        points={[start, end]}
        color="#2a2a44"
        lineWidth={2}
        dashed={false}
      />
      <mesh ref={beadRef}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={fromNode.color} />
      </mesh>
    </>
  );
}
function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 3 + state.mouse.x * 1.5, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1 + state.mouse.y * 1.0, 0.02);
    state.camera.lookAt(3, 1, 0);
  });
  return null;
}
export default function ArchitectureScene() {
  const hoveredRef = useRef(null);
  const [hovered, setHovered] = useMemo(() => {
    let val = null;
    return [
      val,
      (id) => { hoveredRef.current = id; }
    ];
  }, []);
  return (
    <section className="section arch" id="architecture">
      <div className="container">
        <div className="section-center">
          <div className="section-label">🌐 Live Architecture</div>
          <h2 className="section-title">How the <span className="gradient-text">entire system talks.</span></h2>
          <p className="section-sub">An interactive 3D map of every component — from your microphone to your structured meeting summary.</p>
        </div>
      </div>
      <div className="arch__canvas-wrapper">
        <Canvas
          camera={{ position: [3, 1, 10], fov: 55 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 5, 5]} intensity={1.2} color="#bb86fc" />
          <pointLight position={[10, 5, 5]} intensity={0.8} color="#03dac6" />
          {EDGES.map(([from, to], i) => (
            <Edge key={i} from={from} to={to} />
          ))}
          {NODES.map((node) => (
            <Node
              key={node.id}
              node={node}
              hovered={hoveredRef.current}
              onHover={(id) => {
                hoveredRef.current = id;
              }}
            />
          ))}
          <CameraRig />
        </Canvas>
        <div className="arch__hint">Move your mouse to look around · Hover nodes to highlight</div>
      </div>
      {}
      <div className="container">
        <div className="arch__legend">
          {NODES.map((n) => (
            <div key={n.id} className="arch__legend-item">
              <span className="legend-dot" style={{ background: n.color }} />
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
